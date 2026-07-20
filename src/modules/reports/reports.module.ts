import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PdfService } from './pdf.service';
import { AnalyticsService } from './analytics.service';
import { ReportsController } from './reports.controller';
import { FuelPrice } from '../prices/entities/fuel-price.entity';
import { FuelLog } from '../fleet/entities/fuel-log.entity';
import { Vehicle } from '../fleet/entities/vehicle.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FuelPrice, FuelLog, Vehicle, User])],
  providers: [PdfService, AnalyticsService],
  controllers: [ReportsController],
  exports: [PdfService, AnalyticsService],
})
export class ReportsModule {}
