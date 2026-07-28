import { Controller, Get, Query, Logger, BadRequestException } from '@nestjs/common';
import { LocationService } from '../../services/location.service';

@Controller('api/location')
export class LocationController {
  private readonly logger = new Logger(LocationController.name);

  constructor(private readonly locationService: LocationService) {}

  /**
   * GET /api/location/geocode
   * Convertir dirección a coordenadas (lat, lng)
   * Query: address (ej: "Madrid, España")
   */
  @Get('geocode')
  async geocode(@Query('address') address: string) {
    if (!address) {
      throw new BadRequestException('Address query parameter is required');
    }

    this.logger.log(`🗺️ [GET] /api/location/geocode?address=${address}`);
    return await this.locationService.geocode(address);
  }

  /**
   * GET /api/location/distance
   * Calcular distancia entre dos puntos
   * Query: origin_lat, origin_lng, dest_lat, dest_lng, mode (driving|walking|transit)
   */
  @Get('distance')
  async getDistance(
    @Query('origin_lat') originLat: string,
    @Query('origin_lng') originLng: string,
    @Query('dest_lat') destLat: string,
    @Query('dest_lng') destLng: string,
    @Query('mode') mode: 'driving' | 'walking' | 'transit' = 'driving'
  ) {
    if (!originLat || !originLng || !destLat || !destLng) {
      throw new BadRequestException(
        'Required: origin_lat, origin_lng, dest_lat, dest_lng'
      );
    }

    const origin = {
      lat: parseFloat(originLat),
      lng: parseFloat(originLng),
    };
    const destination = {
      lat: parseFloat(destLat),
      lng: parseFloat(destLng),
    };

    this.logger.log(
      `📍 [GET] /api/location/distance (${origin.lat}, ${origin.lng}) → (${destination.lat}, ${destination.lng})`
    );

    return await this.locationService.getDistance(origin, destination, mode);
  }

  /**
   * GET /api/location/nearby-stations
   * Buscar gasolineras cercanas
   * Query: lat, lng, radius_meters (default 5000)
   */
  @Get('nearby-stations')
  async getNearbyStations(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius_meters') radiusMeters: string = '5000'
  ) {
    if (!lat || !lng) {
      throw new BadRequestException('Required: lat, lng');
    }

    this.logger.log(
      `⛽ [GET] /api/location/nearby-stations?lat=${lat}&lng=${lng}`
    );

    return await this.locationService.findNearbyStations(
      parseFloat(lat),
      parseFloat(lng),
      parseInt(radiusMeters, 10)
    );
  }

  /**
   * GET /api/location/place-details
   * Obtener detalles de un lugar
   * Query: place_id (de Google Places)
   */
  @Get('place-details')
  async getPlaceDetails(@Query('place_id') placeId: string) {
    if (!placeId) {
      throw new BadRequestException('Required: place_id');
    }

    this.logger.log(`🏢 [GET] /api/location/place-details?place_id=${placeId}`);

    return await this.locationService.getPlaceDetails(placeId);
  }
}
