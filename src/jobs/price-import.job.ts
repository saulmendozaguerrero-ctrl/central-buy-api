import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

/**
 * Placeholder for future Platts API integration.
 * When PLATTS_API_KEY is set, this job will fetch prices every 15 minutes
 * and upsert them into fuel_prices via PricesService.
 */
@Injectable()
export class PriceImportJob {
  private readonly logger = new Logger(PriceImportJob.name);

  constructor(private readonly configService: ConfigService) {}

  @Cron('0 */15 * * * *')
  async importPlattsData(): Promise<void> {
    const plattsApiKey = this.configService.get<string>('PLATTS_API_KEY');

    if (!plattsApiKey) {
      // Silent skip — Platts integration not yet configured
      return;
    }

    this.logger.log('Importing prices from Platts API...');

    try {
      // TODO: Implement Platts API integration
      // 1. Fetch from https://api.platts.com/v1/market-data
      // 2. Transform to CreatePriceDto[]
      // 3. Call pricesService.uploadPrices()
      this.logger.log('Platts import: not yet implemented');
    } catch (err) {
      this.logger.error('Platts import failed', err);
    }
  }
}
