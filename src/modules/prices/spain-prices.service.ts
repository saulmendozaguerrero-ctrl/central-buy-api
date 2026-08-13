import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import axios from 'axios';
import { StationPrice } from './entities/station-price.entity';
import { PriceSnapshot } from './entities/price-snapshot.entity';

const MINISTERIO_API_URL =
  'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';

const CACHE_TTL = 600; // 10 minutes
const CACHE_KEY_SPAIN = 'spain-prices';

interface MinisterioStation {
  IDEESS: string;
  'Rótulo': string;
  'Dirección': string;
  Municipio: string;
  Provincia: string;
  'C.P.': string;
  Latitud: string;
  'Longitud (WGS84)': string;
  Horario: string;
  'Precio Gasoleo A': string;
  'Precio Gasolina 95 E5': string;
  'Precio Gasolina 98 E5': string;
  'Precio Gasoleo Premium': string;
  [key: string]: string;
}

@Injectable()
export class SpainPricesService implements OnModuleInit {
  private readonly logger = new Logger(SpainPricesService.name);

  constructor(
    @InjectRepository(StationPrice)
    private readonly stationRepo: Repository<StationPrice>,
    @InjectRepository(PriceSnapshot)
    private readonly snapshotRepo: Repository<PriceSnapshot>,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  async onModuleInit() {
    // Fetch on startup, but don't block boot
    this.fetchFromMinisterio().catch((err) =>
      this.logger.error('Initial fetch failed, will retry on next cron', err.message),
    );
  }

  // ─── Cron: every 2 hours ────────────────────────────────────────────
  @Cron(CronExpression.EVERY_2_HOURS)
  async handleCron() {
    this.logger.log('Cron: fetching fuel prices from Ministerio...');
    await this.fetchFromMinisterio();
  }

  // ─── Cron: daily snapshot at 23:30 ──────────────────────────────────
  @Cron('30 23 * * *')
  async handleDailySnapshot() {
    this.logger.log('Cron: saving daily price snapshot...');
    await this.saveDailySnapshot();
  }

  // ─── Core: fetch + upsert ───────────────────────────────────────────
  async fetchFromMinisterio(): Promise<number> {
    try {
      this.logger.log('Fetching from Ministerio API...');
      const response = await axios.get(MINISTERIO_API_URL, { timeout: 30000 });
      const data = response.data;

      const stations: MinisterioStation[] =
        data?.ListaEESSPrecio || data?.['ListaEESSPrecio'] || [];

      if (!stations.length) {
        this.logger.warn('No stations returned from Ministerio API');
        return 0;
      }

      this.logger.log(`Received ${stations.length} stations from Ministerio`);

      // Process in batches of 500 for performance
      const batchSize = 500;
      let totalUpserted = 0;

      for (let i = 0; i < stations.length; i += batchSize) {
        const batch = stations.slice(i, i + batchSize);
        const entities = batch
          .map((s) => this.mapStationToEntity(s))
          .filter((e) => e !== null) as StationPrice[];

        if (entities.length > 0) {
          await this.stationRepo
            .createQueryBuilder()
            .insert()
            .into(StationPrice)
            .values(entities)
            .orUpdate(
              [
                'name',
                'address',
                'municipality',
                'province',
                'postalCode',
                'lat',
                'lng',
                'schedule',
                'dieselPrice',
                'gasoline95Price',
                'gasoline98Price',
                'dieselPremiumPrice',
                'lastUpdated',
              ],
              ['stationId'],
            )
            .execute();

          totalUpserted += entities.length;
        }
      }

      // Invalidate cache after update
      await this.cache.del(CACHE_KEY_SPAIN);

      this.logger.log(`Upserted ${totalUpserted} station prices`);
      return totalUpserted;
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch from Ministerio: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // ─── Map Ministry JSON to entity ────────────────────────────────────
  private mapStationToEntity(s: MinisterioStation): StationPrice | null {
    const stationId = (s.IDEESS || '').trim();
    if (!stationId) return null;

    const entity = new StationPrice();
    entity.stationId = stationId;
    entity.name = (s['Rótulo'] || '').trim();
    entity.address = (s['Dirección'] || '').trim();
    entity.municipality = (s.Municipio || '').trim();
    entity.province = (s.Provincia || '').trim();
    entity.postalCode = (s['C.P.'] || '').trim();
    entity.lat = this.parseSpanishFloat(s.Latitud) as number;
    entity.lng = this.parseSpanishFloat(s['Longitud (WGS84)']) as number;
    entity.schedule = (s.Horario || '').trim();
    entity.dieselPrice = this.parseSpanishFloat(s['Precio Gasoleo A']) as number;
    entity.gasoline95Price = this.parseSpanishFloat(s['Precio Gasolina 95 E5']) as number;
    entity.gasoline98Price = this.parseSpanishFloat(s['Precio Gasolina 98 E5']) as number;
    entity.dieselPremiumPrice = this.parseSpanishFloat(s['Precio Gasoleo Premium']) as number;
    entity.source = 'ministerio';
    entity.lastUpdated = new Date();

    return entity;
  }

  // ─── Parse "1,749" → 1.749 ─────────────────────────────────────────
  private parseSpanishFloat(value: string | undefined | null): number | null {
    if (!value || value.trim() === '' || value.trim() === '—' || value.trim() === '-') {
      return null;
    }
    const cleaned = value.replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  // ─── Get summary (optionally filtered by province) ──────────────────
  async getSummary(province?: string): Promise<any> {
    const cacheKey = province
      ? `${CACHE_KEY_SPAIN}:summary:${province.toUpperCase()}`
      : `${CACHE_KEY_SPAIN}:summary:all`;

    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const qb = this.stationRepo.createQueryBuilder('s');

    if (province) {
      qb.where('UPPER(s.province) = :province', {
        province: province.toUpperCase(),
      });
    }

    const result = await qb
      .select([
        'COUNT(s.id) as "totalStations"',
        'AVG(s.dieselPrice) as "avgDiesel"',
        'MIN(s.dieselPrice) as "minDiesel"',
        'MAX(s.dieselPrice) as "maxDiesel"',
        'COUNT(s.dieselPrice) as "countDiesel"',
        'AVG(s.gasoline95Price) as "avgGasoline95"',
        'MIN(s.gasoline95Price) as "minGasoline95"',
        'MAX(s.gasoline95Price) as "maxGasoline95"',
        'COUNT(s.gasoline95Price) as "countGasoline95"',
      ])
      .getRawOne();

    const summary = {
      totalStations: parseInt(result.totalStations) || 0,
      diesel: {
        avg: this.round(parseFloat(result.avgDiesel)),
        min: this.round(parseFloat(result.minDiesel)),
        max: this.round(parseFloat(result.maxDiesel)),
        count: parseInt(result.countDiesel) || 0,
      },
      gasoline95: {
        avg: this.round(parseFloat(result.avgGasoline95)),
        min: this.round(parseFloat(result.minGasoline95)),
        max: this.round(parseFloat(result.maxGasoline95)),
        count: parseInt(result.countGasoline95) || 0,
      },
    };

    await this.cache.set(cacheKey, summary, CACHE_TTL);
    return summary;
  }

  // ─── Get cheapest stations ──────────────────────────────────────────
  async getCheapest(
    fuel: 'diesel' | 'gasoline95' = 'diesel',
    limit: number = 5,
    province?: string,
  ): Promise<any[]> {
    const priceColumn =
      fuel === 'gasoline95' ? 's.gasoline95Price' : 's.dieselPrice';

    const qb = this.stationRepo
      .createQueryBuilder('s')
      .where(`${priceColumn} IS NOT NULL`)
      .andWhere(`${priceColumn} > 0`);

    if (province) {
      qb.andWhere('UPPER(s.province) = :province', {
        province: province.toUpperCase(),
      });
    }

    const stations = await qb
      .orderBy(priceColumn, 'ASC')
      .take(limit)
      .getMany();

    return stations.map((s) => ({
      id: s.stationId,
      name: s.name,
      address: s.address,
      municipality: s.municipality,
      prices: {
        diesel: s.dieselPrice,
        gasoline95: s.gasoline95Price,
        gasoline98: s.gasoline98Price,
        dieselPremium: s.dieselPremiumPrice,
      },
    }));
  }

  // ─── Full response for GET /api/prices/spain ────────────────────────
  async getSpainPrices(province?: string): Promise<any> {
    const cacheKey = province
      ? `${CACHE_KEY_SPAIN}:full:${province.toUpperCase()}`
      : `${CACHE_KEY_SPAIN}:full:all`;

    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const [summary, cheapestDiesel, cheapestGasoline, stations] =
      await Promise.all([
        this.getSummary(province),
        this.getCheapest('diesel', 5, province),
        this.getCheapest('gasoline95', 5, province),
        this.getStations(province, 50),
      ]);

    const result = {
      totalStations: summary.totalStations,
      timestamp: new Date().toISOString(),
      summary: {
        diesel: summary.diesel,
        gasoline95: summary.gasoline95,
      },
      cheapestDiesel,
      cheapestGasoline,
      stations,
    };

    await this.cache.set(cacheKey, result, CACHE_TTL);
    return result;
  }

  // ─── Get stations (paginated) ───────────────────────────────────────
  async getStations(province?: string, limit: number = 50): Promise<any[]> {
    const qb = this.stationRepo.createQueryBuilder('s');

    if (province) {
      qb.where('UPPER(s.province) = :province', {
        province: province.toUpperCase(),
      });
    }

    qb.andWhere('(s.dieselPrice IS NOT NULL OR s.gasoline95Price IS NOT NULL)');
    qb.orderBy('s.dieselPrice', 'ASC', 'NULLS LAST');
    qb.take(limit);

    const stations = await qb.getMany();

    return stations.map((s) => ({
      id: s.stationId,
      name: s.name,
      address: s.address,
      municipality: s.municipality,
      lat: s.lat,
      lng: s.lng,
      schedule: s.schedule,
      prices: {
        diesel: s.dieselPrice,
        gasoline95: s.gasoline95Price,
        gasoline98: s.gasoline98Price,
        dieselPremium: s.dieselPremiumPrice,
      },
    }));
  }

  // ─── Get alerts: stations below threshold ───────────────────────────
  async getAlerts(
    threshold: number,
    fuel: 'diesel' | 'gasoline95' = 'diesel',
    provincia?: string,
  ): Promise<any> {
    const priceColumn =
      fuel === 'gasoline95' ? 's.gasoline95Price' : 's.dieselPrice';

    const qb = this.stationRepo
      .createQueryBuilder('s')
      .where(`${priceColumn} IS NOT NULL`)
      .andWhere(`${priceColumn} > 0`)
      .andWhere(`${priceColumn} <= :threshold`, { threshold });

    if (provincia) {
      qb.andWhere('UPPER(s.province) = :provincia', {
        provincia: provincia.toUpperCase(),
      });
    }

    const [stations, totalCount] = await qb
      .orderBy(priceColumn, 'ASC')
      .take(50)
      .getManyAndCount();

    // Get average price for context
    const summary = await this.getSummary(provincia);
    const avgPrice =
      fuel === 'gasoline95'
        ? summary.gasoline95.avg
        : summary.diesel.avg;

    return {
      threshold,
      fuel,
      provincia: provincia || 'ALL',
      totalStations: summary.totalStations,
      avg: avgPrice,
      belowCount: totalCount,
      stations: stations.map((s) => ({
        id: s.stationId,
        name: s.name,
        address: s.address,
        municipality: s.municipality,
        price: fuel === 'gasoline95' ? s.gasoline95Price : s.dieselPrice,
        saving: this.round(threshold - (fuel === 'gasoline95' ? s.gasoline95Price : s.dieselPrice)),
        savingPct: Math.round(
          ((threshold - (fuel === 'gasoline95' ? s.gasoline95Price : s.dieselPrice)) / threshold) * 100,
        ),
      })),
      timestamp: new Date().toISOString(),
    };
  }

  // ─── History from snapshots ─────────────────────────────────────────
  async getHistory(days: number = 30): Promise<any[]> {
    const snapshots = await this.snapshotRepo.find({
      order: { snapshotDate: 'ASC' },
      take: days,
    });

    // If we have snapshots, return them
    if (snapshots.length > 0) {
      return snapshots.map((s) => ({
        date: s.snapshotDate,
        diesel_eur_liter: s.avgDiesel,
        gasoline_eur_liter: s.avgGasoline95,
        minDiesel: s.minDiesel,
        maxDiesel: s.maxDiesel,
        minGasoline95: s.minGasoline95,
        maxGasoline95: s.maxGasoline95,
        totalStations: s.totalStations,
        timestamp: s.createdAt,
      }));
    }

    // If no snapshots yet, generate a single entry from current data
    const summary = await this.getSummary();
    if (summary.totalStations > 0) {
      return [
        {
          date: new Date().toISOString().split('T')[0],
          diesel_eur_liter: summary.diesel.avg,
          gasoline_eur_liter: summary.gasoline95.avg,
          minDiesel: summary.diesel.min,
          maxDiesel: summary.diesel.max,
          minGasoline95: summary.gasoline95.min,
          maxGasoline95: summary.gasoline95.max,
          totalStations: summary.totalStations,
          timestamp: new Date().toISOString(),
        },
      ];
    }

    return [];
  }

  // ─── Save daily snapshot ────────────────────────────────────────────
  async saveDailySnapshot(): Promise<PriceSnapshot | null> {
    try {
      const summary = await this.getSummary();
      if (summary.totalStations === 0) {
        this.logger.warn('No stations in DB, skipping daily snapshot');
        return null;
      }

      const today = new Date().toISOString().split('T')[0];

      // Upsert to avoid duplicate date errors
      await this.snapshotRepo
        .createQueryBuilder()
        .insert()
        .into(PriceSnapshot)
        .values({
          snapshotDate: today,
          avgDiesel: summary.diesel.avg,
          avgGasoline95: summary.gasoline95.avg,
          minDiesel: summary.diesel.min,
          maxDiesel: summary.diesel.max,
          minGasoline95: summary.gasoline95.min,
          maxGasoline95: summary.gasoline95.max,
          totalStations: summary.totalStations,
        })
        .orUpdate(
          [
            'avgDiesel',
            'avgGasoline95',
            'minDiesel',
            'maxDiesel',
            'minGasoline95',
            'maxGasoline95',
            'totalStations',
          ],
          ['snapshotDate'],
        )
        .execute();

      this.logger.log(`Daily snapshot saved for ${today}`);
      return this.snapshotRepo.findOne({ where: { snapshotDate: today } });
    } catch (error: any) {
      this.logger.error(`Failed to save daily snapshot: ${error.message}`);
      return null;
    }
  }

  // ─── Get by province ───────────────────────────────────────────────
  async getByProvince(province: string): Promise<any[]> {
    const stations = await this.stationRepo.find({
      where: { province: province.toUpperCase() } as any,
      order: { dieselPrice: 'ASC' },
    });

    return stations.map((s) => ({
      id: s.stationId,
      name: s.name,
      address: s.address,
      municipality: s.municipality,
      lat: s.lat,
      lng: s.lng,
      schedule: s.schedule,
      prices: {
        diesel: s.dieselPrice,
        gasoline95: s.gasoline95Price,
        gasoline98: s.gasoline98Price,
        dieselPremium: s.dieselPremiumPrice,
      },
    }));
  }

  // ─── Manual trigger (for admin) ─────────────────────────────────────
  async manualRefresh(): Promise<{ upserted: number; timestamp: string }> {
    const upserted = await this.fetchFromMinisterio();
    return { upserted, timestamp: new Date().toISOString() };
  }

  // ─── Helpers ────────────────────────────────────────────────────────
  private round(value: number, decimals: number = 3): number {
    if (isNaN(value) || value === null || value === undefined) return 0;
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }
}
