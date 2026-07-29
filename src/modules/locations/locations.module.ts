import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LocationsController } from './locations.controller';
import { GooglePlacesService } from '../../services/google-places.service';
import { WeatherService } from '../../services/weather.service';

@Module({
  imports: [HttpModule],
  controllers: [LocationsController],
  providers: [GooglePlacesService, WeatherService],
  exports: [GooglePlacesService, WeatherService],
})
export class LocationsModule {}
