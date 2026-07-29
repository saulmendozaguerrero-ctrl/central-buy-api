import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MarketDataService } from '../services/market-data.service';
import { PricesService } from '../modules/prices/prices.service';

/**
 * Price Import Job
 * Runs every 6 hours to fetch real-time oil prices and update database
 * Sources: Oil Price API (Brent/WTI) + Alpha Vantage (USD/EUR exchange rate)
 */
@Injectable()
export class PriceImportJob {
  private readonly logger = new Logger(PriceImportJob.name);

  constructor(
    private readonly marketDataService: MarketDataService,
    private readonly pricesService: PricesService,
  ) {}

  @Cron('0 */6 * * * *') // Every 6 hours: 00:00, 06:00, 12:00, 18:00
  async importMarketPrices(): Promise<void> {
    this.logger.log('🔄 Starting price import job...');

    try {
      // 1. Fetch real-time market data
      const marketData = await this.marketDataService.getMarketData();

      if (marketData.status !== 'success') {
        this.logger.warn('⚠️ Market data fetch returned fallback data');
        return;
      }

      // 2. Extract prices and convert to database format
      const { market } = marketData;
      const priceDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Create price records for Diesel and Gasoline (Europe region)
      const priceRecords = [
        {
          product: 'diesel',
          region: 'europe',
          country: null,
          priceUsd: (market.diesel_eur_per_liter / market.exchange_rate_usd_to_eur).toFixed(2),
          priceEur: market.diesel_eur_per_liter.toFixed(4),
          unit: 'eur_per_liter',
          source: market.source,
          priceDate,
        },
        {
          product: 'gasoline',
          region: 'europe',
          country: null,
          priceUsd: (market.gasoline_95_eur_per_liter / market.exchange_rate_usd_to_eur).toFixed(2),
          priceEur: market.gasoline_95_eur_per_liter.toFixed(4),
          unit: 'eur_per_liter',
          source: market.source,
          priceDate,
        },
      ];

      // 3. Upsert prices into database
      for (const record of priceRecords) {
        await this.pricesService.createOrUpdate(record);
      }

      this.logger.log(
        `✅ Price import completed. Diesel: €${market.diesel_eur_per_liter}/L, Gasoline: €${market.gasoline_95_eur_per_liter}/L`
      );
    } catch (err) {
      this.logger.error('❌ Price import failed:', err.message);
      // Job continues on next interval even if this one fails
    }
  }
}
