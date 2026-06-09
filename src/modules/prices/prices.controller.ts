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
    const priceData = [
      { product: FuelProduct.DIESEL, region: FuelRegion.EUROPE, priceEur: 1171.50, priceUsd: 1285.00, priceDate: new Date().toISOString().split('T')[0] },
      { product: FuelProduct.GASOLINE, region: FuelRegion.EUROPE, priceEur: 987.30, priceUsd: 1082.50, priceDate: new Date().toISOString().split('T')[0] },
      { product: FuelProduct.JET_FUEL, region: FuelRegion.EUROPE, priceEur: 1043.20, priceUsd: 1144.00, priceDate: new Date().toISOString().split('T')[0] },
      { product: FuelProduct.CRUDE, region: FuelRegion.EUROPE, priceEur: 752.40, priceUsd: 825.00, priceDate: new Date().toISOString().split('T')[0] },
      { product: FuelProduct.DIESEL, region: FuelRegion.LATAM, priceEur: 1098.20, priceUsd: 1205.00, priceDate: new Date().toISOString().split('T')[0] },
    ] as any;
    return await this.pricesService.uploadPrices(priceData, null as any);
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
