import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LocationController } from './location.controller';
import { LocationService } from '../../services/location.service';
import { GovernmentController } from './government.controller';
import { GovernmentStationsService } from '../../services/government-stations.service';

@Module({
  imports: [HttpModule],
  controllers: [LocationController, GovernmentController],
  providers: [LocationService, GovernmentStationsService],
  exports: [LocationService, GovernmentStationsService],
})
export class LocationModule {}
