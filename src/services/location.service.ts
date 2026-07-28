import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);
  private readonly GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  private readonly GOOGLE_MAPS_BASE = 'https://maps.googleapis.com/maps/api';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Geocoding: convertir dirección a coordenadas (lat, lng)
   * Usa Google Maps Geocoding API
   */
  async geocode(address: string) {
    this.logger.log(`🗺️ Geocoding: ${address}`);

    if (!this.GOOGLE_MAPS_API_KEY) {
      this.logger.warn('⚠️ GOOGLE_MAPS_API_KEY no configurada');
      throw new Error('Google Maps API key not configured');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.GOOGLE_MAPS_BASE}/geocode/json`, {
          params: {
            address,
            key: this.GOOGLE_MAPS_API_KEY,
          },
        })
      );

      const result = response.data?.results?.[0];

      if (!result) {
        this.logger.warn(`❌ Dirección no encontrada: ${address}`);
        return {
          status: 'NOT_FOUND',
          address,
          message: 'Address not found',
        };
      }

      const { lat, lng } = result.geometry.location;
      const formattedAddress = result.formatted_address;

      return {
        status: 'OK',
        address: formattedAddress,
        coordinates: { lat, lng },
        place_id: result.place_id,
        geometry_type: result.geometry.location_type,
      };
    } catch (error) {
      this.logger.error('❌ Error geocoding:', error.message);
      throw new Error(`Geocoding failed: ${error.message}`);
    }
  }

  /**
   * Calcular distancia entre dos puntos (lat, lng)
   * Usa Google Maps Distance Matrix API
   */
  async getDistance(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: 'driving' | 'walking' | 'transit' = 'driving'
  ) {
    this.logger.log(
      `📍 Calculando distancia: (${origin.lat}, ${origin.lng}) → (${destination.lat}, ${destination.lng})`
    );

    if (!this.GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.GOOGLE_MAPS_BASE}/distancematrix/json`,
          {
            params: {
              origins: `${origin.lat},${origin.lng}`,
              destinations: `${destination.lat},${destination.lng}`,
              mode,
              key: this.GOOGLE_MAPS_API_KEY,
            },
          }
        )
      );

      const element = response.data?.rows?.[0]?.elements?.[0];

      if (!element || element.status !== 'OK') {
        return { status: 'ERROR', message: 'Distance calculation failed' };
      }

      return {
        status: 'OK',
        origin,
        destination,
        mode,
        distance: {
          meters: element.distance.value,
          km: (element.distance.value / 1000).toFixed(2),
          text: element.distance.text,
        },
        duration: {
          seconds: element.duration.value,
          minutes: (element.duration.value / 60).toFixed(0),
          text: element.duration.text,
        },
      };
    } catch (error) {
      this.logger.error('❌ Error calculating distance:', error.message);
      throw new Error(`Distance calculation failed: ${error.message}`);
    }
  }

  /**
   * Buscar gasolineras cercanas (Places Nearby)
   * Usa Google Maps Places Nearby Search
   */
  async findNearbyStations(
    lat: number,
    lng: number,
    radiusMeters: number = 5000
  ) {
    this.logger.log(
      `⛽ Buscando gasolineras cercanas: (${lat}, ${lng}) en radio ${radiusMeters}m`
    );

    if (!this.GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.GOOGLE_MAPS_BASE}/place/nearbysearch/json`,
          {
            params: {
              location: `${lat},${lng}`,
              radius: radiusMeters,
              type: 'gas_station',
              key: this.GOOGLE_MAPS_API_KEY,
            },
          }
        )
      );

      const places = response.data?.results || [];

      return {
        status: 'OK',
        search_location: { lat, lng },
        radius_meters: radiusMeters,
        found: places.length,
        stations: places.map((place) => ({
          name: place.name,
          location: place.geometry.location,
          address: place.vicinity,
          rating: place.rating || 'N/A',
          open_now: place.opening_hours?.open_now || null,
          place_id: place.place_id,
          types: place.types,
        })),
      };
    } catch (error) {
      this.logger.error('❌ Error finding nearby stations:', error.message);
      throw new Error(`Nearby search failed: ${error.message}`);
    }
  }

  /**
   * Obtener detalles de un lugar (Place Details)
   * Incluye: teléfono, horarios, calificaciones
   */
  async getPlaceDetails(placeId: string) {
    this.logger.log(`🏢 Obteniendo detalles del lugar: ${placeId}`);

    if (!this.GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.GOOGLE_MAPS_BASE}/place/details/json`, {
          params: {
            place_id: placeId,
            key: this.GOOGLE_MAPS_API_KEY,
            fields:
              'name,formatted_address,formatted_phone_number,opening_hours,rating,reviews,website,url',
          },
        })
      );

      const place = response.data?.result;

      if (!place) {
        return { status: 'NOT_FOUND' };
      }

      return {
        status: 'OK',
        name: place.name,
        address: place.formatted_address,
        phone: place.formatted_phone_number || 'N/A',
        website: place.website || 'N/A',
        rating: place.rating || 'N/A',
        opening_hours: place.opening_hours,
        reviews_count: place.reviews?.length || 0,
        google_maps_url: place.url,
      };
    } catch (error) {
      this.logger.error('❌ Error getting place details:', error.message);
      throw new Error(`Place details failed: ${error.message}`);
    }
  }
}
