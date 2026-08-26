import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PlattsService } from '../modules/prices/platts.service';
import { LinkedInScraper } from '../modules/prices/linkedin-bot/linkedin-scraper';
import { PlattsParser } from '../modules/prices/platts-parser';

/**
 * Platts Scrape Job
 * 
 * Runs daily at 10:00 Madrid time to fetch Darioush Kanjouri's LinkedIn posts
 * containing Platts European Marketscan data.
 * 
 * Flow:
 * 1. Scrape LinkedIn profile for new Platts posts
 * 2. Parse post text to extract commodity prices
 * 3. Store in database (platts_prices + platts_snapshots)
 * 4. Alert via Telegram on success/failure
 * 
 * Retries: up to 3 attempts with 5-minute intervals
 */
@Injectable()
export class PlattsScrapeJob {
  private readonly logger = new Logger(PlattsScrapeJob.name);
  private readonly maxRetries = 3;
  private readonly retryDelayMs = 5 * 60 * 1000; // 5 minutes

  private readonly telegramBotToken: string;
  private readonly telegramChatId: string;
  private readonly linkedinCookie: string;

  constructor(
    private readonly plattsService: PlattsService,
    private readonly configService: ConfigService,
  ) {
    this.telegramBotToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
    this.telegramChatId = this.configService.get<string>('TELEGRAM_ALERT_CHAT_ID') || '';
    this.linkedinCookie = this.configService.get<string>('LINKEDIN_SESSION_COOKIE') || '';
  }

  /**
   * Cron: Daily at 10:00 Madrid (Europe/Madrid = UTC+1/+2)
   * Darioush typically posts Platts data in the morning CET
   */
  @Cron('0 10 * * 1-5', { timeZone: 'Europe/Madrid' }) // Weekdays only (Platts doesn't publish weekends)
  async handleDailyScrape(): Promise<void> {
    this.logger.log('🔄 Starting daily Platts scrape job...');

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.executeScrape();

        if (result.success) {
          const msg = [
            '✅ <b>Platts Data Ingested</b>',
            `📅 Date: ${result.reportDate}`,
            `📊 Products: ${result.pricesInserted}`,
            `🛢️ Brent: $${result.brentPrice || '—'}/bbl`,
            `💱 EUR/USD: ${result.eurUsd || '—'}`,
            `🔗 Source: ${result.sourceType}`,
          ].join('\n');

          await this.sendTelegramAlert(msg);
          this.logger.log(`✅ Platts scrape completed: ${result.pricesInserted} prices ingested`);
          return;
        }

        if (result.noNewData) {
          this.logger.log('ℹ️ No new Platts data found (may not be posted yet)');
          if (attempt < this.maxRetries) {
            this.logger.log(`⏳ Retry ${attempt + 1}/${this.maxRetries} in 5 minutes...`);
            await this.delay(this.retryDelayMs);
          }
          continue;
        }

        throw new Error(result.error || 'Unknown error');
      } catch (err) {
        const errorMsg = (err as Error).message;
        this.logger.error(`❌ Platts scrape attempt ${attempt}/${this.maxRetries} failed: ${errorMsg}`);

        if (attempt === this.maxRetries) {
          await this.sendTelegramAlert(
            `❌ <b>Platts Scrape FAILED</b>\n\n` +
            `Error: ${errorMsg}\n` +
            `Attempts: ${this.maxRetries}\n\n` +
            `⚠️ Manual data entry may be required.\n` +
            `Use POST /api/platts/ingest endpoint.`
          );
        } else {
          await this.delay(this.retryDelayMs);
        }
      }
    }
  }

  /**
   * Execute the actual scrape
   */
  private async executeScrape(): Promise<{
    success: boolean;
    noNewData?: boolean;
    reportDate?: string;
    pricesInserted?: number;
    brentPrice?: number;
    eurUsd?: number;
    sourceType?: string;
    error?: string;
  }> {
    const scraper = new LinkedInScraper({
      linkedinSessionCookie: this.linkedinCookie || undefined,
      useSearchProxy: !this.linkedinCookie,
      telegramBotToken: this.telegramBotToken,
      telegramChatId: this.telegramChatId,
    });

    // Try to fetch posts
    const posts = await scraper.fetchLatestPlattsPosts();

    if (posts.length === 0) {
      return { success: false, noNewData: true };
    }

    // Process the most recent Platts post
    const latestPost = posts[0];
    let fullText = latestPost.postText;

    // If text is too short (search engine snippet), try to get full content
    if (fullText.length < 200 && this.linkedinCookie) {
      const fullContent = await scraper.fetchPostContent(latestPost.postUrl);
      if (fullContent) fullText = fullContent;
    }

    // Parse the post
    const parsed = PlattsParser.parse(fullText, latestPost.postUrl);
    if (!parsed) {
      return { success: false, noNewData: true, error: 'Could not parse Platts data from post' };
    }

    // Check if we already have data for this date
    const { snapshot: existingSnapshot } = await this.plattsService.getLatest();
    if (existingSnapshot && existingSnapshot.reportDate === parsed.reportDate) {
      return { success: false, noNewData: true, error: `Data for ${parsed.reportDate} already exists` };
    }

    // Ingest the data
    const result = await this.plattsService.ingestParsedData(parsed, latestPost.postUrl);

    return {
      success: true,
      reportDate: parsed.reportDate,
      pricesInserted: result.pricesInserted,
      brentPrice: parsed.brentFrontMonth,
      eurUsd: parsed.eurUsd,
      sourceType: 'linkedin_scrape',
    };
  }

  /**
   * Manual trigger endpoint (for testing or manual runs)
   */
  async manualScrape(): Promise<any> {
    return this.executeScrape();
  }

  // ─── Helpers ────────────────────────────────────────────────────────

  private async sendTelegramAlert(message: string): Promise<void> {
    if (!this.telegramBotToken || !this.telegramChatId) {
      this.logger.warn('Telegram not configured. Skipping alert.');
      return;
    }

    try {
      await axios.post(
        `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`,
        {
          chat_id: this.telegramChatId,
          text: message,
          parse_mode: 'HTML',
        },
        { timeout: 10000 },
      );
    } catch (err) {
      this.logger.error('Telegram alert failed:', (err as Error).message);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
