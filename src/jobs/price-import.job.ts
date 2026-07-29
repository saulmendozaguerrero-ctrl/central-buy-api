import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MarketDataService } from '../services/market-data.service';

/**
 * Price Import Job
 * Runs every hour to fetch real-time oil prices and log them
 * Sources: Oil Price API (Brent/WTI) + Alpha Vantage (USD/EUR exchange rate)
 */
@Injectable()
export class PriceImportJob {
  private readonly logger = new Logger(PriceImportJob.name);

  constructor(
    private readonly marketDataService: MarketDataService,
  ) {}

  @Cron('0 0 * * * *') // Every hour at minute 0
  async importMarketPrices(): Promise<void> {
    this.logger.log('🔄 Starting price import job...');

    try {
      // Fetch real-time market data
      const marketData = await this.marketDataService.getMarketData();

      if (marketData.status !== 'success') {
        this.logger.warn('⚠️ Market data fetch returned fallback data');
        return;
      }

      const { market } = marketData;

      this.logger.log(
        `✅ Price import completed. Brent: $${market.brent_usd}/bbl, ` +
        `WTI: $${market.wti_usd}/bbl, ` +
        `Diesel: €${market.diesel_eur_per_liter}/L, ` +
        `Gasoline: €${market.gasoline_95_eur_per_liter}/L, ` +
        `Source: ${market.source}`
      );
    } catch (err) {
      this.logger.error('❌ Price import failed:', err instanceof Error ? err.message : err);
    }
  }
}
