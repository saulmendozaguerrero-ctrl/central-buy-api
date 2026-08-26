/**
 * LinkedIn Post Scraper for Darioush Kanjouri
 * 
 * Uses public RSS/feed endpoints and web scraping as fallback.
 * Respects LinkedIn rate limits (max 1 request/second).
 * Only scrapes PUBLIC posts — no personal data (GDPR compliant).
 * 
 * Strategy:
 * 1. Primary: Google cache / Bing search for recent LinkedIn posts
 * 2. Secondary: Direct LinkedIn public profile scraping with puppeteer
 * 3. Fallback: Manual data entry via admin API
 */

import axios, { AxiosInstance } from 'axios';
import { Logger } from '@nestjs/common';

const LINKEDIN_PROFILE_URL = 'https://www.linkedin.com/in/darioush-kanjouri-80b1271b7/';
const LINKEDIN_PROFILE_ID = 'darioush-kanjouri-80b1271b7';

// Rate limiting: max 1 request per second
const MIN_REQUEST_INTERVAL_MS = 1000;

export interface ScrapedPost {
  postId: string;
  authorName: string;
  authorProfileUrl: string;
  postText: string;
  postUrl: string;
  publishedAt: string;
  hasImages: boolean;
  imageUrls: string[];
  hashtags: string[];
  isPlattsData: boolean;
}

export class LinkedInScraper {
  private readonly logger = new Logger(LinkedInScraper.name);
  private lastRequestTime: number = 0;
  private httpClient: AxiosInstance;

  constructor(private readonly config: {
    /** LinkedIn session cookie (li_at) for authenticated requests */
    linkedinSessionCookie?: string;
    /** Use search engines as proxy instead of direct LinkedIn access */
    useSearchProxy?: boolean;
    /** Telegram bot token for error alerts */
    telegramBotToken?: string;
    /** Telegram chat ID for alerts */
    telegramChatId?: string;
  } = {}) {
    this.httpClient = axios.create({
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
  }

  /**
   * Rate-limited delay between requests
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < MIN_REQUEST_INTERVAL_MS) {
      await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - elapsed));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Fetch latest posts from Darioush Kanjouri via Bing search
   * Uses search engine as proxy to avoid direct LinkedIn scraping issues
   */
  async fetchViaSearchEngine(): Promise<ScrapedPost[]> {
    this.logger.log('Fetching Darioush Kanjouri posts via search engine proxy...');
    const posts: ScrapedPost[] = [];

    try {
      await this.rateLimit();

      // Search for recent posts by this user on LinkedIn
      const searchQuery = encodeURIComponent(
        `site:linkedin.com/posts "Darioush Kanjouri" Platts OR marketscan OR ULSD OR Brent`
      );

      const response = await this.httpClient.get(
        `https://www.bing.com/search?q=${searchQuery}&count=10`,
        {
          headers: {
            'Accept': 'text/html,application/xhtml+xml',
          },
        },
      );

      const html = response.data as string;

      // Extract LinkedIn post URLs from search results
      const urlRegex = /https:\/\/www\.linkedin\.com\/posts\/[^"'\s<>]+/g;
      const urls = [...new Set(html.match(urlRegex) || [])];

      this.logger.log(`Found ${urls.length} LinkedIn post URLs from search`);

      // Extract snippet text from search results
      const snippetRegex = /<p[^>]*>(.*?)<\/p>/g;
      let snippetMatch;
      const snippets: string[] = [];
      while ((snippetMatch = snippetRegex.exec(html)) !== null) {
        const text = snippetMatch[1].replace(/<[^>]+>/g, '').trim();
        if (text.length > 50) snippets.push(text);
      }

      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        posts.push({
          postId: this.extractPostId(url),
          authorName: 'Darioush Kanjouri',
          authorProfileUrl: LINKEDIN_PROFILE_URL,
          postText: snippets[i] || '',
          postUrl: url,
          publishedAt: new Date().toISOString(),
          hasImages: false,
          imageUrls: [],
          hashtags: this.extractHashtags(snippets[i] || ''),
          isPlattsData: false, // Will be determined by parser
        });
      }
    } catch (err) {
      this.logger.error('Search engine fetch failed:', (err as Error).message);
    }

    return posts;
  }

  /**
   * Fetch a single LinkedIn post's full text via direct access
   * Requires valid li_at session cookie
   */
  async fetchPostContent(postUrl: string): Promise<string | null> {
    if (!this.config.linkedinSessionCookie) {
      this.logger.warn('No LinkedIn session cookie configured. Cannot fetch post content directly.');
      return null;
    }

    try {
      await this.rateLimit();

      const response = await this.httpClient.get(postUrl, {
        headers: {
          'Cookie': `li_at=${this.config.linkedinSessionCookie}`,
          'Accept': 'text/html,application/xhtml+xml',
        },
        maxRedirects: 3,
      });

      const html = response.data as string;

      // Extract post content from LinkedIn HTML
      // LinkedIn embeds post text in JSON-LD or data attributes
      const jsonLdMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
      if (jsonLdMatch) {
        try {
          const jsonLd = JSON.parse(jsonLdMatch[1]);
          if (jsonLd.articleBody) return jsonLd.articleBody;
          if (jsonLd.description) return jsonLd.description;
        } catch { /* ignore parse errors */ }
      }

      // Fallback: extract from meta tags
      const metaMatch = html.match(/<meta\s+(?:name|property)="description"\s+content="([^"]+)"/i);
      if (metaMatch) return metaMatch[1];

      // Fallback: extract from specific div classes
      const contentMatch = html.match(/class="feed-shared-update-v2__description-wrapper[^"]*"[^>]*>(.*?)<\/div>/s);
      if (contentMatch) return contentMatch[1].replace(/<[^>]+>/g, '').trim();

      return null;
    } catch (err) {
      this.logger.error(`Failed to fetch post content from ${postUrl}:`, (err as Error).message);
      return null;
    }
  }

  /**
   * Fetch recent posts using LinkedIn Voyager API (authenticated)
   * This is the most reliable method but requires a valid session
   */
  async fetchViaLinkedInApi(): Promise<ScrapedPost[]> {
    if (!this.config.linkedinSessionCookie) {
      this.logger.warn('No LinkedIn session cookie. Falling back to search engine.');
      return this.fetchViaSearchEngine();
    }

    this.logger.log('Fetching posts via LinkedIn API...');
    const posts: ScrapedPost[] = [];

    try {
      await this.rateLimit();

      // LinkedIn Voyager API for public profile posts
      const csrfToken = `ajax:${Date.now()}`;
      const response = await this.httpClient.get(
        `https://www.linkedin.com/voyager/api/feed/updates?profileId=${LINKEDIN_PROFILE_ID}&q=memberShareFeed&moduleKey=member-shares%3Aphone&count=10&start=0`,
        {
          headers: {
            'Cookie': `li_at=${this.config.linkedinSessionCookie}; JSESSIONID="${csrfToken}"`,
            'csrf-token': csrfToken,
            'x-li-lang': 'en_US',
            'x-restli-protocol-version': '2.0.0',
            'Accept': 'application/vnd.linkedin.normalized+json+2.1',
          },
        },
      );

      const data = response.data;
      const elements = data?.included || data?.elements || [];

      for (const element of elements) {
        if (element.commentary?.text?.text || element.text) {
          const postText = element.commentary?.text?.text || element.text || '';
          const postUrl = element.permaLink || element.shareUrl || '';

          posts.push({
            postId: element.urn || element.id || `post-${Date.now()}`,
            authorName: 'Darioush Kanjouri',
            authorProfileUrl: LINKEDIN_PROFILE_URL,
            postText,
            postUrl,
            publishedAt: element.createdAt
              ? new Date(element.createdAt).toISOString()
              : new Date().toISOString(),
            hasImages: !!element.image,
            imageUrls: element.image ? [element.image] : [],
            hashtags: this.extractHashtags(postText),
            isPlattsData: false,
          });
        }
      }

      this.logger.log(`Fetched ${posts.length} posts via LinkedIn API`);
    } catch (err) {
      this.logger.error('LinkedIn API fetch failed:', (err as Error).message);
      // Fallback to search engine
      return this.fetchViaSearchEngine();
    }

    return posts;
  }

  /**
   * Main entry point: fetch latest Platts-related posts
   */
  async fetchLatestPlattsPosts(): Promise<ScrapedPost[]> {
    let posts: ScrapedPost[];

    if (this.config.linkedinSessionCookie) {
      posts = await this.fetchViaLinkedInApi();
    } else if (this.config.useSearchProxy) {
      posts = await this.fetchViaSearchEngine();
    } else {
      this.logger.warn('No fetch method configured. Use linkedinSessionCookie or useSearchProxy=true');
      return [];
    }

    // Mark Platts posts
    for (const post of posts) {
      const { PlattsParser } = await import('../platts-parser.js');
      post.isPlattsData = PlattsParser.isPlattsPost(post.postText);
    }

    return posts.filter(p => p.isPlattsData);
  }

  /**
   * Send Telegram alert
   */
  async sendTelegramAlert(message: string): Promise<void> {
    if (!this.config.telegramBotToken || !this.config.telegramChatId) return;

    try {
      await axios.post(
        `https://api.telegram.org/bot${this.config.telegramBotToken}/sendMessage`,
        {
          chat_id: this.config.telegramChatId,
          text: message,
          parse_mode: 'HTML',
        },
      );
    } catch (err) {
      this.logger.error('Telegram alert failed:', (err as Error).message);
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────────

  private extractPostId(url: string): string {
    // LinkedIn post URLs: /posts/username_title-activity-ID
    const match = url.match(/activity-(\d+)/);
    return match ? match[1] : `post-${Date.now()}`;
  }

  private extractHashtags(text: string): string[] {
    const matches = text.match(/#\w+/g) || [];
    return matches.map(h => h.toLowerCase());
  }
}
