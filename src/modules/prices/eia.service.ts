import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

/**
 * EIA (U.S. Energy Information Administration) service
 *
 * Free, official government source for Brent, WTI, diesel and gasoline
 * reference prices — independent of the LinkedIn Platts scraper.
 *
 * Docs: https://www.eia.gov/opendata/documentation.php
 */
export interface EiaIndicators {
  brentUsd: number | null;
  brentDate: string | null;
  wtiUsd: number | null;
  wtiDate: string | null;
  dieselUsUsd: number | null;
  dieselDate: string | null;
  gasolineUsUsd: number | null;
  gasolineDate: string | null;
}

@Injectable()
export class EiaService {
  private readonly logger = new Logger(EiaService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.eia.gov/v2';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('EIA_API_KEY') || '';
  }

  private async fetchSeries(path: string, series: string, frequency: 'daily' | 'weekly' = 'daily'): Promise<{ value: number; period: string } | null> {
    if (!this.apiKey) {
      this.logger.warn('EIA_API_KEY not configured. Skipping EIA fetch.');
      return null;
    }

    try {
      const response = await axios.get(`${this.baseUrl}${path}`, {
        params: {
          api_key: this.apiKey,
          frequency,
          'data[0]': 'value',
          'facets[series][]': series,
          'sort[0][column]': 'period',
          'sort[0][direction]': 'desc',
          length: 1,
        },
        timeout: 15000,
      });

      const row = response.data?.response?.data?.[0];
      if (!row || row.value === undefined || row.value === null) return null;

      return { value: parseFloat(row.value), period: row.period };
    } catch (err) {
      this.logger.error(`EIA fetch failed for series ${series}: ${(err as Error).message}`);
      return null;
    }
  }

  /**
   * Fetch Brent, WTI, US diesel and US gasoline reference prices from EIA.
   * These are official, government-sourced, and independent of the LinkedIn
   * scraper — used to fill Brent/WTI/diesel/gasoline sector indicators even
   * on days when the LinkedIn Platts post doesn't include them.
   */
  async getIndicators(): Promise<EiaIndicators> {
    const [brent, wti, diesel, gasoline] = await Promise.all([
      this.fetchSeries('/petroleum/pri/spt/data/', 'RBRTE', 'daily'),
      this.fetchSeries('/petroleum/pri/spt/data/', 'RWTC', 'daily'),
      this.fetchSeries('/petroleum/pri/gnd/data/', 'EMD_EPD2D_PTE_NUS_DPG', 'weekly'),
      this.fetchSeries('/petroleum/pri/gnd/data/', 'EMM_EPMR_PTE_NUS_DPG', 'weekly'),
    ]);

    return {
      brentUsd: brent?.value ?? null,
      brentDate: brent?.period ?? null,
      wtiUsd: wti?.value ?? null,
      wtiDate: wti?.period ?? null,
      dieselUsUsd: diesel?.value ?? null,
      dieselDate: diesel?.period ?? null,
      gasolineUsUsd: gasoline?.value ?? null,
      gasolineDate: gasoline?.period ?? null,
    };
  }
}
