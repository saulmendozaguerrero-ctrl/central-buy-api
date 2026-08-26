import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PlattsService } from './platts.service';
import { PlattsCategory } from './entities/platts-price.entity';

@ApiTags('Platts')
@Controller('platts')
export class PlattsController {
  constructor(private readonly plattsService: PlattsService) {}

  @Get('scrape-status')
  @ApiOperation({ summary: 'Get last scrape status for post-scrape alerts' })
  async getScrapeStatus() {
    const status = await this.plattsService.getScrapeStatus();
    return { data: status };
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get latest Platts data (PUBLIC)' })
  async getLatest() {
    const result = await this.plattsService.getLatest();
    return {
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get Platts dashboard summary (PUBLIC)' })
  async getDashboard() {
    const summary = await this.plattsService.getDashboardSummary();
    return { data: summary };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get Platts price history' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days (default 30)' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category (diesel, gasoline, jet, etc.)' })
  @ApiQuery({ name: 'productKey', required: false, description: 'Filter by product key' })
  async getHistory(
    @Query('days') days?: string,
    @Query('category') category?: string,
    @Query('productKey') productKey?: string,
  ) {
    const numDays = days ? parseInt(days) : 30;
    const cat = category as PlattsCategory | undefined;
    const prices = await this.plattsService.getHistory(numDays, cat, productKey);
    return { data: prices, count: prices.length };
  }

  @Get('products')
  @ApiOperation({ summary: 'Get available product keys' })
  async getProducts() {
    const keys = await this.plattsService.getProductKeys();
    return { data: keys };
  }

  @Get('product-history')
  @ApiOperation({ summary: 'Get price history for a specific product' })
  @ApiQuery({ name: 'productKey', required: true })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days (default 90)' })
  async getProductHistory(
    @Query('productKey') productKey: string,
    @Query('days') days?: string,
  ) {
    const numDays = days ? parseInt(days) : 90;
    const prices = await this.plattsService.getProductHistory(productKey, numDays);
    return { data: prices, count: prices.length };
  }

  @Get('snapshots')
  @ApiOperation({ summary: 'Get list of Platts snapshots' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of snapshots (default 30)' })
  async getSnapshots(@Query('limit') limit?: string) {
    const numLimit = limit ? parseInt(limit) : 30;
    const snapshots = await this.plattsService.getSnapshots(numLimit);
    return { data: snapshots, count: snapshots.length };
  }

  @Get('compare')
  @ApiOperation({ summary: 'Compare Platts wholesale vs Spain government retail prices' })
  async compare() {
    const comparison = await this.plattsService.comparePlattsVsGovernment();
    return { data: comparison };
  }

  @Post('ingest')
  @ApiOperation({ summary: 'Ingest Platts data from LinkedIn post text (ADMIN)' })
  async ingestPost(
    @Body() body: { postText: string; postUrl?: string },
  ) {
    try {
      const result = await this.plattsService.ingestFromLinkedInPost(body.postText, body.postUrl);
      if (!result) {
        return { success: false, error: 'Post does not contain valid Platts data' };
      }
      return { success: true, ...result };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  @Post('ingest-json')
  @ApiOperation({ summary: 'Ingest Platts data from JSON (ADMIN)' })
  async ingestJson(@Body() body: Record<string, any>) {
    try {
      const result = await this.plattsService.ingestFromJson(body);
      if (!result) {
        return { success: false, error: 'Failed to parse JSON data' };
      }
      return { success: true, ...result };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}
