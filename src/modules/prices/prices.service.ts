import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindManyOptions } from 'typeorm';
import type { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { FuelPrice, FuelProduct, FuelRegion } from './entities/fuel-price.entity';
import { CreatePriceDto } from './dto/create-price.dto';
import { PriceHistoryQueryDto } from './dto/price-query.dto';
import { User } from '../users/entities/user.entity';

const CACHE_TTL = 300; // 5 minutes
const CACHE_KEY_LATEST = 'prices:latest';
const CACHE_KEY_BEST = 'prices:best';

@Injectable()
export class PricesService {
  private readonly logger = new Logger(PricesService.name);

  constructor(
    @InjectRepository(FuelPrice)
    private readonly priceRepo: Repository<FuelPrice>,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  async getLatest(): Promise<FuelPrice[]> {
    const cached = await this.cache.get<FuelPrice[]>(CACHE_KEY_LATEST);
    if (cached) return cached;

    // Get latest price per product+region combination
    const prices = await this.priceRepo
      .createQueryBuilder('p')
      .distinctOn(['p.product', 'p.region'])
      .orderBy('p.product')
      .addOrderBy('p.region')
      .addOrderBy('p.priceDate', 'DESC')
      .getMany();

    await this.cache.set(CACHE_KEY_LATEST, prices, CACHE_TTL);
    return prices;
  }

  async getByProduct(product: FuelProduct): Promise<FuelPrice[]> {
    const cacheKey = `prices:product:${product}`;
    const cached = await this.cache.get<FuelPrice[]>(cacheKey);
    if (cached) return cached;

    const prices = await this.priceRepo
      .createQueryBuilder('p')
      .where('p.product = :product', { product })
      .distinctOn(['p.region'])
      .orderBy('p.region')
      .addOrderBy('p.priceDate', 'DESC')
      .getMany();

    await this.cache.set(cacheKey, prices, CACHE_TTL);
    return prices;
  }

  async getByRegion(region: FuelRegion): Promise<FuelPrice[]> {
    const cacheKey = `prices:region:${region}`;
    const cached = await this.cache.get<FuelPrice[]>(cacheKey);
    if (cached) return cached;

    const prices = await this.priceRepo
      .createQueryBuilder('p')
      .where('p.region = :region', { region })
      .distinctOn(['p.product'])
      .orderBy('p.product')
      .addOrderBy('p.priceDate', 'DESC')
      .getMany();

    await this.cache.set(cacheKey, prices, CACHE_TTL);
    return prices;
  }

  async getHistory(query: PriceHistoryQueryDto): Promise<FuelPrice[]> {
    const where: FindManyOptions<FuelPrice>['where'] = {};

    if (query.product) (where as any).product = query.product;
    if (query.region) (where as any).region = query.region;

    if (query.from && query.to) {
      (where as any).priceDate = Between(query.from, query.to);
    }

    return this.priceRepo.find({
      where,
      order: { priceDate: 'DESC' },
      take: 500,
    });
  }

  async getBestPrices(): Promise<Record<string, FuelPrice>> {
    const cached = await this.cache.get<Record<string, FuelPrice>>(CACHE_KEY_BEST);
    if (cached) return cached;

    const allLatest = await this.getLatest();
    const best: Record<string, FuelPrice> = {};

    for (const price of allLatest) {
      const existing = best[price.product];
      if (!existing || Number(price.priceUsd) < Number(existing.priceUsd)) {
        best[price.product] = price;
      }
    }

    await this.cache.set(CACHE_KEY_BEST, best, CACHE_TTL);
    return best;
  }

  async uploadPrices(dtos: CreatePriceDto[], createdBy: User): Promise<FuelPrice[]> {
    const entities = dtos.map((dto) =>
      this.priceRepo.create({ ...dto, createdBy, source: 'manual' }),
    );

    const saved = await this.priceRepo.save(entities);

    // Invalidate relevant caches
    await Promise.all([
      this.cache.del(CACHE_KEY_LATEST),
      this.cache.del(CACHE_KEY_BEST),
      ...dtos.map((d) => this.cache.del(`prices:product:${d.product}`)),
      ...dtos.map((d) => this.cache.del(`prices:region:${d.region}`)),
    ]);

    this.logger.log(`Uploaded ${saved.length} prices by admin ${createdBy.id}`);
    return saved;
  }
}
