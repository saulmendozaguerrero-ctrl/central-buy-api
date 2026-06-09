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
    @Get('seed')
  async seed() {
    const priceData = [
      { product: 'Diesel', region: 'Europe', priceEur: 1171.50, priceUsd: 1285.00, priceDate: new Date() },
      { product: 'Gasoline', region: 'Europe', priceEur: 987.30, priceUsd: 1082.50, priceDate: new Date() },
      { product: 'Jet Fuel', region: 'Europe', priceEur: 1043.20, priceUsd: 1144.00, priceDate: new Date() },
      { product: 'LNG', region: 'Global', priceEur: 19.86, priceUsd: 21.75, priceDate: new Date() },
      { product: 'Brent Crude', region: 'Global', priceEur: 752.40, priceUsd: 825.00, priceDate: new Date() },
    ];
    return await this.pricesService.uploadPrices(priceData, null as any);
  }

}
