import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricesController } from './prices.controller';
import { PricesService } from './prices.service';
import { SpainPricesService } from './spain-prices.service';
import { FuelPrice } from './entities/fuel-price.entity';
import { StationPrice } from './entities/station-price.entity';
import { PriceSnapshot } from './entities/price-snapshot.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FuelPrice, StationPrice, PriceSnapshot, Subscription, User]),
    UsersModule,
  ],
  controllers: [PricesController],
  providers: [PricesService, SpainPricesService],
  exports: [PricesService, SpainPricesService],
})
export class PricesModule {}
