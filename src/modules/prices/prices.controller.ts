import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PricesService } from './prices.service';
import { CreatePriceDto } from './dto/create-price.dto';
import { PriceHistoryQueryDto } from './dto/price-query.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, User } from '../users/entities/user.entity';
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

  @Post('admin/upload')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Upload prices' })
  async uploadPrices(@Body() prices: any, @CurrentUser() user: User) { return this.pricesService.uploadPrices(prices, user.id); }
}
