import { Controller, Get, Query, Logger } from '@nestjs/common';
import { GasBuddyService } from '../../services/gasbbuddy.service';
import { WeatherService } from '../../services/weather.service';

@Controller('api/locations')
export class LocationsController {
  private readonly logger = new Logger(LocationsController.name);

  constructor(
    private readonly gasBuddyService: GasBuddyService,
    private readonly weatherService: WeatherService,
  ) {}

  /**
   * GET /api/locations/nearby-stations
   * Obtener gasolineras cercanas con precios reales
   */
  @Get('nearby-stations')
  async getNearbyStations(
    @Query('lat') latitude: string,
    @Query('lng') longitude: string,
    @Query('radius') radius: string = '5',
  ) {
    this.logger.log(`📍 Buscando estaciones: lat=${latitude}, lng=${longitude}, radius=${radius}km`);

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusKm = parseInt(radius) || 5;

    if (isNaN(lat) || isNaN(lng)) {
      return {
        status: 'error',
        message: 'Invalid coordinates',
        data: [],
      };
    }

    const stations = await this.gasBuddyService.getNearbyStations(lat, lng, radiusKm);
    return {
      status: stations.status,
      count: stations.count,
      data: stations.stations,
      timestamp: stations.timestamp,
    };
  }

  /**
   * GET /api/locations/cheapest-station
   * Obtener gasolinera más barata en área
   */
  @Get('cheapest-station')
  async getCheapestStation(
    @Query('lat') latitude: string,
    @Query('lng') longitude: string,
    @Query('fuel') fuelType: 'diesel' | 'gasoline' = 'diesel',
  ) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    const cheapest = await this.gasBuddyService.getCheapestStation(lat, lng, fuelType);

    if (!cheapest) {
      return {
        status: 'error',
        message: 'No stations found',
        data: null,
      };
    }

    return {
      status: 'success',
      data: cheapest,
    };
  }
}
