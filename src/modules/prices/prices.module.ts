import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricesController } from './prices.controller';
import { PlattsController } from './platts.controller';
import { PricesService } from './prices.service';
import { PlattsService } from './platts.service';
import { SpainPricesService } from './spain-prices.service';
import { FuelPrice } from './entities/fuel-price.entity';
import { StationPrice } from './entities/station-price.entity';
import { PriceSnapshot } from './entities/price-snapshot.entity';
import { PlattsPrice, PlattsSnapshot } from './entities/platts-price.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FuelPrice, StationPrice, PriceSnapshot,
      PlattsPrice, PlattsSnapshot,
      Subscription, User,
    ]),
    UsersModule,
  ],
  controllers: [PricesController, PlattsController],
  providers: [PricesService, PlattsService, SpainPricesService],
  exports: [PricesService, PlattsService, SpainPricesService],
})
export class PricesModule {}
