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
 * Runs every 15 minutes between 09:00-11:45 Madrid time (weekdays) to fetch
 * Darioush Kanjouri's LinkedIn posts containing Platts European Marketscan data.
 * 
 * Window: 09:00, 09:15, 09:30, 09:45, 10:00, 10:15, 10:30, 10:45, 11:00, 11:15, 11:30, 11:45
 * 
 * Flow:
 * 1. Check if today's data already ingested (dedup by reportDate) → skip if yes
 * 2. Scrape LinkedIn profile for new Platts posts
 * 3. Parse post text to extract commodity prices
 * 4. Store in database (platts_prices + platts_snapshots)
 * 5. Alert via Telegram on success/failure
 * 
 * Deduplication: Checks reportDate before ingestion — safe for repeated calls
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
   * Cron: Every 15 min between 09:00-11:45 Madrid (Europe/Madrid = UTC+1/+2)
   * Window: L-V 09:00, 09:15, 09:30, ..., 11:30, 11:45
   * Darioush posts Platts data in the morning CET — timing varies day to day.
   * Each invocation checks for new data; skips if already ingested today.
   */
  @Cron('0,15,30,45 9-11 * * 1-5', { timeZone: 'Europe/Madrid' })
  async handleDailyScrape(): Promise<void> {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' });

    // Check if today's data already ingested (dedup)
    const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Europe/Madrid' }); // YYYY-MM-DD
    const { snapshot: existingSnapshot } = await this.plattsService.getLatest();
    if (existingSnapshot && existingSnapshot.reportDate === todayStr) {
      this.logger.log(`⏭️ [${timeStr}] Platts data for ${todayStr} already ingested. Skipping.`);
      return;
    }

    this.logger.log(`🔄 [${timeStr}] Starting Platts scrape (window 09:00-11:45)...`);

    try {
      const result = await this.executeScrape();

      if (result.success) {
        const msg = [
          '✅ <b>Platts Data Ingested</b>',
          `📅 Date: ${result.reportDate}`,
          `⏰ Captured at: ${timeStr} Madrid`,
          `📊 Products: ${result.pricesInserted}`,
          `🛢️ Brent: $${result.brentPrice || '—'}/bbl`,
          `💱 EUR/USD: ${result.eurUsd || '—'}`,
          `🔗 Source: ${result.sourceType}`,
        ].join('\n');

        await this.sendTelegramAlert(msg);
        this.logger.log(`✅ [${timeStr}] Platts scrape completed: ${result.pricesInserted} prices ingested`);
        return;
      }

      if (result.noNewData) {
        this.logger.log(`ℹ️ [${timeStr}] No new Platts data found. Will retry next window slot.`);
        return;
      }

      throw new Error(result.error || 'Unknown error');
    } catch (err) {
      const errorMsg = (err as Error).message;
      this.logger.error(`❌ [${timeStr}] Platts scrape failed: ${errorMsg}`);

      // Only send failure alert on the LAST slot of the window (11:45)
      const currentHour = now.toLocaleString('en-US', { timeZone: 'Europe/Madrid', hour: 'numeric', hour12: false });
      const currentMin = now.toLocaleString('en-US', { timeZone: 'Europe/Madrid', minute: 'numeric' });
      if (parseInt(currentHour) === 11 && parseInt(currentMin) >= 45) {
        await this.sendTelegramAlert(
          `❌ <b>Platts Scrape FAILED</b>\n\n` +
          `Error: ${errorMsg}\n` +
          `Window: 09:00-11:45 (all slots exhausted)\n\n` +
          `⚠️ Manual data entry may be required.\n` +
          `Use POST /api/platts/ingest endpoint.`
        );
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
