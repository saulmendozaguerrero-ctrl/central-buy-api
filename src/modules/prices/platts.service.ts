import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PlattsPrice, PlattsSnapshot, PlattsCategory, PlattsRegion } from './entities/platts-price.entity';
import { PlattsParser, ParsedPlattsSnapshot, ParsedPlattsPrice } from './platts-parser';

const CACHE_TTL = 600; // 10 minutes

@Injectable()
export class PlattsService {
  private readonly logger = new Logger(PlattsService.name);

  constructor(
    @InjectRepository(PlattsPrice)
    private readonly priceRepo: Repository<PlattsPrice>,
    @InjectRepository(PlattsSnapshot)
    private readonly snapshotRepo: Repository<PlattsSnapshot>,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  // ─── Get Latest Platts Data ──────────────────────────────────────────

  async getLatest(): Promise<{
    snapshot: PlattsSnapshot | null;
    prices: PlattsPrice[];
  }> {
    const cacheKey = 'platts:latest';
    const cached = await this.cache.get<{ snapshot: PlattsSnapshot | null; prices: PlattsPrice[] }>(cacheKey);
    if (cached) return cached;

    const snapshot = await this.snapshotRepo.findOne({
      where: {},
      order: { reportDate: 'DESC' },
    });

    let prices: PlattsPrice[] = [];
    if (snapshot) {
      prices = await this.priceRepo.find({
        where: { priceDate: snapshot.reportDate },
        order: { category: 'ASC', region: 'ASC' },
      });
    }

    const result = { snapshot, prices };
    await this.cache.set(cacheKey, result, CACHE_TTL);
    return result;
  }

  // ─── Get History (last N days) ───────────────────────────────────────

  async getHistory(days: number = 30, category?: PlattsCategory, productKey?: string): Promise<PlattsPrice[]> {
    const cacheKey = `platts:history:${days}:${category || 'all'}:${productKey || 'all'}`;
    const cached = await this.cache.get<PlattsPrice[]>(cacheKey);
    if (cached) return cached;

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    const fromStr = fromDate.toISOString().split('T')[0];
    const toStr = new Date().toISOString().split('T')[0];

    const qb = this.priceRepo.createQueryBuilder('p')
      .where('p.priceDate BETWEEN :from AND :to', { from: fromStr, to: toStr })
      .orderBy('p.priceDate', 'ASC')
      .addOrderBy('p.category', 'ASC');

    if (category) qb.andWhere('p.category = :category', { category });
    if (productKey) qb.andWhere('p.productKey = :productKey', { productKey });

    const prices = await qb.take(5000).getMany();
    await this.cache.set(cacheKey, prices, CACHE_TTL);
    return prices;
  }

  // ─── Get Snapshots List ──────────────────────────────────────────────

  async getSnapshots(limit: number = 30): Promise<PlattsSnapshot[]> {
    return this.snapshotRepo.find({
      order: { reportDate: 'DESC' },
      take: limit,
      select: { id: true, reportDate: true, sourcePub: true, brentFrontMonth: true, eurUsd: true, status: true, createdAt: true },
    });
  }

  // ─── Compare Platts vs Spain Government Prices ──────────────────────

  async comparePlattsVsGovernment(): Promise<{
    plattsLatest: { diesel: number | null; gasoline: number | null; date: string | null };
    govLatest: { diesel: number | null; gasoline: number | null };
    delta: { diesel: number | null; gasoline: number | null };
  }> {
    const { prices } = await this.getLatest();

    const dieselPlatts = prices.find(
      p => p.category === PlattsCategory.DIESEL && p.region === PlattsRegion.NW_EUROPE
    );
    const gasolinePlatts = prices.find(
      p => p.category === PlattsCategory.GASOLINE && p.region === PlattsRegion.ROTTERDAM
    );

    return {
      plattsLatest: {
        diesel: dieselPlatts ? Number(dieselPlatts.priceUsd) : null,
        gasoline: gasolinePlatts ? Number(gasolinePlatts.priceUsd) : null,
        date: dieselPlatts?.priceDate || null,
      },
      govLatest: { diesel: null, gasoline: null }, // Populated by caller with SpainPricesService
      delta: { diesel: null, gasoline: null },
    };
  }

  // ─── Ingest Parsed Data ─────────────────────────────────────────────

  async ingestParsedData(parsed: ParsedPlattsSnapshot, sourceUrl?: string): Promise<{
    snapshotId: string;
    pricesInserted: number;
  }> {
    // Check for existing snapshot on this date
    const existing = await this.snapshotRepo.findOne({
      where: { reportDate: parsed.reportDate },
    });

    if (existing) {
      this.logger.warn(`Snapshot already exists for ${parsed.reportDate} (id=${existing.id}). Updating...`);
      await this.priceRepo.delete({ priceDate: parsed.reportDate });
      await this.snapshotRepo.remove(existing);
    }

    // Create snapshot
    const snapshot = this.snapshotRepo.create({
      reportDate: parsed.reportDate,
      sourcePub: parsed.sourcePub,
      volumeIssue: parsed.volumeIssue,
      eurUsd: parsed.eurUsd,
      gbpUsd: parsed.gbpUsd,
      brentFrontMonth: parsed.brentFrontMonth,
      context: parsed.context,
      fullData: { prices: parsed.prices },
      linkedinPostUrl: sourceUrl,
      rawPostText: parsed.rawPostText,
      status: 'processed',
    });

    const savedSnapshot = await this.snapshotRepo.save(snapshot);

    // Create price entries
    const priceEntities = parsed.prices.map(p =>
      this.priceRepo.create({
        priceDate: parsed.reportDate,
        category: p.category,
        region: p.region,
        productKey: p.productKey,
        productLabel: p.productLabel,
        priceUsd: p.priceUsd,
        priceEur: p.priceEur,
        unit: p.unit,
        changeUsd: p.changeUsd,
        changePct: p.changePct,
        deliveryType: p.deliveryType,
        source: sourceUrl ? 'linkedin_scrape' : 'manual',
        sourceUrl,
        rawSnippet: p.rawSnippet,
      })
    );

    const savedPrices = await this.priceRepo.save(priceEntities);

    // Invalidate caches
    await Promise.all([
      this.cache.del('platts:latest'),
      this.cache.del(`platts:history:30:all:all`),
    ]);

    this.logger.log(
      `Ingested Platts data for ${parsed.reportDate}: ${savedPrices.length} prices, ` +
      `Brent: $${parsed.brentFrontMonth || '—'}/bbl`
    );

    return { snapshotId: savedSnapshot.id, pricesInserted: savedPrices.length };
  }

  // ─── Ingest from JSON file (historical data) ────────────────────────

  async ingestFromJson(data: Record<string, any>): Promise<{
    snapshotId: string;
    pricesInserted: number;
  } | null> {
    const parsed = PlattsParser.parseJsonSnapshot(data);
    if (!parsed) {
      this.logger.warn('Failed to parse JSON snapshot');
      return null;
    }
    return this.ingestParsedData(parsed);
  }

  // ─── Ingest from LinkedIn post text ──────────────────────────────────

  async ingestFromLinkedInPost(postText: string, postUrl?: string): Promise<{
    snapshotId: string;
    pricesInserted: number;
  } | null> {
    const parsed = PlattsParser.parse(postText, postUrl);
    if (!parsed) {
      this.logger.warn('Post does not contain valid Platts data');
      return null;
    }
    return this.ingestParsedData(parsed, postUrl);
  }

  // ─── Get Products List ──────────────────────────────────────────────

  async getProductKeys(): Promise<string[]> {
    const result = await this.priceRepo
      .createQueryBuilder('p')
      .select('DISTINCT p.productKey', 'productKey')
      .orderBy('p.productKey', 'ASC')
      .getRawMany();

    return result.map(r => r.productKey);
  }

  // ─── Get Price for specific product over time ───────────────────────

  async getProductHistory(productKey: string, days: number = 90): Promise<PlattsPrice[]> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    const fromStr = fromDate.toISOString().split('T')[0];

    return this.priceRepo.find({
      where: {
        productKey,
        priceDate: Between(fromStr, new Date().toISOString().split('T')[0]) as any,
      },
      order: { priceDate: 'ASC' },
    });
  }

  // ─── Summary for dashboard ──────────────────────────────────────────

  async getDashboardSummary(): Promise<{
    date: string;
    brent: number | null;
    eurUsd: number | null;
    keyPrices: Array<{
      product: string;
      label: string;
      category: string;
      region: string;
      priceUsd: number;
      priceEur: number | null;
      unit: string;
      change: number | null;
    }>;
    context: Record<string, any>;
    totalProducts: number;
  }> {
    const { snapshot, prices } = await this.getLatest();
    if (!snapshot) {
      return {
        date: new Date().toISOString().split('T')[0],
        brent: null,
        eurUsd: null,
        keyPrices: [],
        context: {},
        totalProducts: 0,
      };
    }

    // Key reference products for the dashboard
    const keyProductKeys = [
      'ulsd_10ppm_cif_nwe',
      'ulsd_10ppm_fob_med',
      'diesel_10ppm_fob_rotterdam',
      'eurobob_fob_rotterdam',
      'prem_unl_10ppm_fob_med',
      'jet_cif_nwe',
      'jet_fob_med',
      'naphtha_cif_nwe',
      'fo_1pct_fob_rotterdam',
      'mf_05pct_fob_rotterdam',
      'brent_front_month',
    ];

    const keyPrices = prices
      .filter(p => keyProductKeys.includes(p.productKey))
      .map(p => ({
        product: p.productKey,
        label: p.productLabel,
        category: p.category,
        region: p.region,
        priceUsd: Number(p.priceUsd),
        priceEur: p.priceEur ? Number(p.priceEur) : null,
        unit: p.unit,
        change: p.changeUsd ? Number(p.changeUsd) : null,
      }));

    return {
      date: snapshot.reportDate,
      brent: snapshot.brentFrontMonth ? Number(snapshot.brentFrontMonth) : null,
      eurUsd: snapshot.eurUsd ? Number(snapshot.eurUsd) : null,
      keyPrices,
      context: snapshot.context || {},
      totalProducts: prices.length,
    };
  }
}
