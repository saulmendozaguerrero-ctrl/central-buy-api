import { Controller, Get, Post, Query, Param, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PricesService } from './prices.service';
import { SpainPricesService } from './spain-prices.service';
import { PriceHistoryQueryDto } from './dto/price-query.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { FuelProduct, FuelRegion } from './entities/fuel-price.entity';

@ApiTags('Prices')
@Controller('prices')
export class PricesController {
  constructor(
    private readonly pricesService: PricesService,
    private readonly spainPricesService: SpainPricesService,
  ) {}

  @Get('latest')
  @ApiOperation({ summary: 'Get latest prices (PUBLIC)' })
  async getLatest() { return this.pricesService.getLatest(); }

  @Get('best')
  @ApiOperation({ summary: 'Get best prices (PUBLIC)' })
  async getBest() { return this.pricesService.getBestPrices(); }

  @Post('update-daily')
  @ApiOperation({ summary: 'Update daily prices (ADMIN ONLY)' })
  async updateDailyPrices() {
    try {
      const result = await this.pricesService.updateDailyPrices();
      return { message: 'Prices updated successfully', updated: result, timestamp: new Date().toISOString() };
    } catch (e) {
      return { error: (e as Error).message, timestamp: new Date().toISOString() };
    }
  }

  @Get('history')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Price history' })
  async getHistory(@Query() query: PriceHistoryQueryDto) { return this.pricesService.getHistory(query); }

  @Get('product/:product')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Prices by product' })
  async getByProduct(@Param('product') product: FuelProduct) { return this.pricesService.getByProduct(product); }

  @Get('region/:region')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Prices by region' })
  async getByRegion(@Param('region') region: FuelRegion) { return this.pricesService.getByRegion(region); }

  // ─── Spain Fuel Station Prices (Ministerio) ───────────────────────────

  @Get('spain')
  @ApiOperation({ summary: 'Get Spain fuel station prices (PUBLIC)' })
  @ApiQuery({ name: 'provincia', required: false, description: 'Filter by province name' })
  async getSpainPrices(@Query('provincia') provincia?: string) {
    const data = await this.spainPricesService.getSpainPrices(provincia);
    return { data };
  }

  @Get('spain/history')
  @ApiOperation({ summary: 'Get Spain fuel price history (PUBLIC)' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days (default 30)' })
  async getSpainHistory(@Query('days') days?: string) {
    const numDays = days ? parseInt(days) : 30;
    const data = await this.spainPricesService.getHistory(numDays);
    return { data };
  }

  @Get('spain/alerts')
  @ApiOperation({ summary: 'Get Spain fuel price alerts (PUBLIC)' })
  @ApiQuery({ name: 'threshold', required: false, description: 'Price threshold (default 1.80)' })
  @ApiQuery({ name: 'fuel', required: false, description: 'Fuel type: diesel or gasoline95' })
  @ApiQuery({ name: 'provincia', required: false, description: 'Province filter' })
  async getSpainAlerts(
    @Query('threshold') threshold?: string,
    @Query('fuel') fuel?: string,
    @Query('provincia') provincia?: string,
  ) {
    const thresholdNum = threshold ? parseFloat(threshold) : 1.80;
    const fuelType = fuel === 'gasoline95' ? 'gasoline95' : 'diesel';
    const data = await this.spainPricesService.getAlerts(thresholdNum, fuelType, provincia);
    return { data };
  }

  @Post('spain/refresh')
  @ApiOperation({ summary: 'Manually refresh Spain prices from Ministerio (ADMIN)' })
  async refreshSpainPrices() {
    const result = await this.spainPricesService.manualRefresh();
    return { success: true, ...result };
  }
}
