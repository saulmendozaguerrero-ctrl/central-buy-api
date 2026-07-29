import { Controller, Get, Query, Logger } from '@nestjs/common';
import { GooglePlacesService } from '../../services/google-places.service';
import { WeatherService } from '../../services/weather.service';

@Controller('api/locations')
export class LocationsController {
  private readonly logger = new Logger(LocationsController.name);

  constructor(
    private readonly googlePlacesService: GooglePlacesService,
    private readonly weatherService: WeatherService,
  ) {}

  /**
   * GET /api/locations/nearby-gas-stations
   * Obtener gasolineras cercanas usando Google Places API
   */
  @Get('nearby-gas-stations')
  async getNearbyGasStations(
    @Query('lat') latitude: string,
    @Query('lng') longitude: string,
    @Query('radius') radius: string = '5000',
  ) {
    this.logger.log(`📍 Buscando gasolineras: lat=${latitude}, lng=${longitude}, radius=${radius}m`);

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusMeters = parseInt(radius) || 5000;

    if (isNaN(lat) || isNaN(lng)) {
      return {
        status: 'error',
        message: 'Invalid coordinates',
        data: [],
      };
    }

    try {
      const response = await this.googlePlacesService.getNearbyGasStations(lat, lng, radiusMeters);
      return {
        status: response?.status || 'success',
        count: response?.count || 0,
        data: response?.stations || [],
        timestamp: response?.timestamp || new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error fetching gas stations: ${error.message}`);
      return {
        status: 'error',
        message: error.message,
        data: [],
      };
    }
  }
}
