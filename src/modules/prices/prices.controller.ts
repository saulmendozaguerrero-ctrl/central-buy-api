import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
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

  @Get('seed')
  async seed() {
    try {
      const priceData = [
        { product: FuelProduct.DIESEL, region: FuelRegion.EUROPE, priceEur: 1171.50, priceUsd: 1285.00, priceDate: '2026-06-09' },
        { product: FuelProduct.GASOLINE, region: FuelRegion.EUROPE, priceEur: 987.30, priceUsd: 1082.50, priceDate: '2026-06-09' },
      ];
      return { message: 'Test endpoint working', count: priceData.length };
    } catch (e) {
      return { error: e.message };
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
