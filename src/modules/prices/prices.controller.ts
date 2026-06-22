import { Controller, Get, Post, Query, Param, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PricesService } from './prices.service';
import { PriceHistoryQueryDto } from './dto/price-query.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { FuelProduct, FuelRegion } from './entities/fuel-price.entity';

@ApiTags('Prices')
@Controller('prices')
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

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
      return { error: e.message, timestamp: new Date().toISOString() };
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
}
