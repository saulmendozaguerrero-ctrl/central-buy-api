import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FleetController } from './fleet.controller';
import { FleetService } from './fleet.service';
import { EcoScoreService } from './eco-score.service';
import { Vehicle } from './entities/vehicle.entity';
import { FuelLog } from './entities/fuel-log.entity';
import { EcoScore } from './entities/eco-score.entity';
import { Report } from './entities/report.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, FuelLog, EcoScore, Report, Subscription, User]), UsersModule],
  controllers: [FleetController],
  providers: [FleetService, EcoScoreService],
  exports: [FleetService, EcoScoreService, TypeOrmModule],
})
export class FleetModule {}
