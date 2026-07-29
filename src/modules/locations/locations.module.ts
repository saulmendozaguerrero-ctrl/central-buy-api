import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LocationsController } from './locations.controller';
import { GasBuddyService } from '../../services/gasbbuddy.service';
import { WeatherService } from '../../services/weather.service';

@Module({
  imports: [HttpModule],
  controllers: [LocationsController],
  providers: [GasBuddyService, WeatherService],
  exports: [GasBuddyService, WeatherService],
})
export class LocationsModule {}
