import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfiguratorController } from './configurator.controller';
import { ConfiguratorService } from './configurator.service';
import { PriceConfig } from './entities/price-config.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PriceConfig, Subscription, User]), UsersModule],
  controllers: [ConfiguratorController],
  providers: [ConfiguratorService],
  exports: [ConfiguratorService],
})
export class ConfiguratorModule {}
