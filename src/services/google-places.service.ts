import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

interface GasStation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  rating: number;
  reviews_count: number;
  phone?: string;
  website?: string;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
}

interface GooglePlacesResponse {
  status: 'success' | 'error';
  stations: GasStation[];
  count: number;
  timestamp: string;
}

@Injectable()
export class GooglePlacesService {
  private readonly logger = new Logger(GooglePlacesService.name);
  private readonly GOOGLE_PLACES_API = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
  private readonly googleMapsApiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.googleMapsApiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
  }

  /**
   * Buscar gasolineras cercanas usando Google Places API
   */
  async getNearbyGasStations(
    latitude: number,
    longitude: number,
    radius_meters: number = 5000,
  ): Promise<GooglePlacesResponse> {
    this.logger.log(
      `🔍 Buscando gasolineras con Google Places: ${latitude}, ${longitude} (radio: ${radius_meters / 1000}km)`,
    );
    this.logger.log(`Google Maps API Key present: ${this.googleMapsApiKey ? 'YES' : 'NO (usando mock)'}`);

    try {
      // Si no hay API key, usar mock directamente
      if (!this.googleMapsApiKey) {
        this.logger.warn('⚠️ Google Maps API key not configured, using mock data');
        return {
          status: 'error',
          stations: this.getMockGasStations(latitude, longitude),
          count: 5,
          timestamp: new Date().toISOString(),
        };
      }

      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(this.GOOGLE_PLACES_API, {
          params: {
            location: `${latitude},${longitude}`,
            radius: radius_meters,
            type: 'gas_station',
            key: this.googleMapsApiKey,
            language: 'es',
          },
          timeout: 5000,
        }),
      );

      if (response.data.status !== 'OK') {
        this.logger.warn(`⚠️ Google Places API returned: ${response.data.status}`);
        return {
          status: 'error',
          stations: this.getMockGasStations(latitude, longitude),
          count: 5,
          timestamp: new Date().toISOString(),
        };
      }

      const results = response.data.results || [];

      // Transform Google Places format to internal format
      const stations: GasStation[] = results.map((place: any) => ({
        id: place.place_id,
        name: place.name,
        address: place.vicinity,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        distance_km: this.calculateDistance(latitude, longitude, place.geometry.location.lat, place.geometry.location.lng),
        rating: place.rating || 0,
        reviews_count: place.user_ratings_total || 0,
        phone: place.formatted_phone_number,
        website: place.website,
        opening_hours: place.opening_hours
          ? {
              open_now: place.opening_hours.open_now,
              weekday_text: place.opening_hours.weekday_text || [],
            }
          : undefined,
      }));

      // Sort by distance
      stations.sort((a, b) => a.distance_km - b.distance_km);

      this.logger.log(`✅ Encontradas ${stations.length} gasolineras con Google Places`);

      return {
        status: 'success',
        stations: stations.slice(0, 20), // Limit to 20 closest
        count: stations.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`❌ Error fetching Google Places: ${error.message}`);

      // Fallback: Mock stations
      return {
        status: 'error',
        stations: this.getMockGasStations(latitude, longitude),
        count: 5,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  }

  /**
   * Mock gas stations for fallback
   */
  private getMockGasStations(latitude: number, longitude: number): GasStation[] {
    return [
      {
        id: 'repsol_madrid_1',
        name: 'Repsol - Calle Mayor',
        address: 'Calle Mayor, 1, 28005 Madrid',
        latitude: latitude + 0.01,
        longitude: longitude + 0.01,
        distance_km: 0.8,
        rating: 4.5,
        reviews_count: 234,
        phone: '+34 91 234 5678',
        website: 'https://www.repsol.com',
        opening_hours: {
          open_now: true,
          weekday_text: ['Lunes: Abierto 24 horas', 'Martes: Abierto 24 horas'],
        },
      },
      {
        id: 'cepsa_madrid_1',
        name: 'CEPSA - Paseo Castellana',
        address: 'Paseo de la Castellana, Madrid',
        latitude: latitude - 0.01,
        longitude: longitude - 0.01,
        distance_km: 1.2,
        rating: 4.3,
        reviews_count: 156,
        phone: '+34 91 345 6789',
        website: 'https://www.cepsa.es',
        opening_hours: {
          open_now: true,
          weekday_text: ['Lunes: Abierto 24 horas', 'Martes: Abierto 24 horas'],
        },
      },
      {
        id: 'bp_madrid_1',
        name: 'BP - Gran Vía',
        address: 'Gran Vía, 123, Madrid',
        latitude: latitude + 0.02,
        longitude: longitude - 0.02,
        distance_km: 2.1,
        rating: 4.1,
        reviews_count: 89,
        phone: '+34 91 456 7890',
        opening_hours: {
          open_now: true,
          weekday_text: [],
        },
      },
      {
        id: 'eni_madrid_1',
        name: 'Eni - Avenida Diagonal',
        address: 'Avenida Diagonal, Barcelona',
        latitude: latitude - 0.02,
        longitude: longitude + 0.02,
        distance_km: 1.5,
        rating: 4.4,
        reviews_count: 112,
        phone: '+34 93 567 8901',
        opening_hours: {
          open_now: false,
          weekday_text: [],
        },
      },
      {
        id: 'independent_1',
        name: 'Gasolinera Independiente Premium',
        address: 'Polígono Industrial, Madrid',
        latitude: latitude,
        longitude: longitude,
        distance_km: 0.5,
        rating: 4.6,
        reviews_count: 178,
        phone: '+34 91 678 9012',
        opening_hours: {
          open_now: true,
          weekday_text: [],
        },
      },
    ];
  }
}
