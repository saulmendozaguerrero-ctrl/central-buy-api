import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

interface GasStation {
  id: string;
  name: string;
  brand: string;
  latitude: number;
  longitude: number;
  address: string;
  distance_km: number;
  diesel_price_eur: number;
  gasoline_price_eur: number;
  last_updated: string;
}

interface GasBuddyResponse {
  status: 'success' | 'error';
  stations: GasStation[];
  count: number;
  timestamp: string;
}

@Injectable()
export class GasBuddyService {
  private readonly logger = new Logger(GasBuddyService.name);
  private readonly GASBDDY_API = 'https://api.gasbuddy.com/v2';
  private readonly gasBuddyApiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.gasBuddyApiKey = this.configService.get<string>('GASBDDY_API_KEY') || 'demo';
  }

  /**
   * Obtener precios de gasolineras cercanas (GasBuddy)
   * Retorna estaciones dentro de radius en km
   */
  async getNearbyStations(
    latitude: number,
    longitude: number,
    radius_km: number = 5,
  ): Promise<GasBuddyResponse> {
    this.logger.log(
      `🔍 Buscando gasolineras cercanas a ${latitude}, ${longitude} (radio: ${radius_km}km)`,
    );

    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(`${this.GASBDDY_API}/locations`, {
          params: {
            latitude,
            longitude,
            distance: radius_km,
            limit: 50,
            apikey: this.gasBuddyApiKey,
          },
          timeout: 5000,
        }),
      );

      const rawStations = response.data?.locations || [];

      // Transform GasBuddy format to internal format
      const stations: GasStation[] = rawStations.map((station: any) => ({
        id: station.id || station.name.replace(/\s+/g, '_').toLowerCase(),
        name: station.name,
        brand: station.brand || 'Independiente',
        latitude: parseFloat(station.lat),
        longitude: parseFloat(station.lng),
        address: station.address || 'N/A',
        distance_km: parseFloat(station.distance) || 0,
        diesel_price_eur: parseFloat(station.diesel?.price || '1.35'),
        gasoline_price_eur: parseFloat(station.gasoline?.price || '1.42'),
        last_updated: station.updated_at || new Date().toISOString(),
      }));

      this.logger.log(`✅ Encontradas ${stations.length} gasolineras`);

      return {
        status: 'success',
        stations: stations.sort((a, b) => a.distance_km - b.distance_km),
        count: stations.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`❌ Error fetching GasBuddy data: ${error.message}`);

      // Fallback: Mock stations para testing
      return {
        status: 'error',
        stations: this.getMockStations(latitude, longitude),
        count: 5,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Obtener estación más barata en área
   */
  async getCheapestStation(
    latitude: number,
    longitude: number,
    fuelType: 'diesel' | 'gasoline' = 'diesel',
  ): Promise<GasStation | null> {
    const response = await this.getNearbyStations(latitude, longitude, 10);

    if (response.stations.length === 0) return null;

    const priceField = fuelType === 'diesel' ? 'diesel_price_eur' : 'gasoline_price_eur';
    return response.stations.reduce((cheapest, station) => {
      return station[priceField] < cheapest[priceField] ? station : cheapest;
    });
  }

  /**
   * Mock data for fallback (when API fails)
   */
  private getMockStations(latitude: number, longitude: number): GasStation[] {
    return [
      {
        id: 'repsol_1',
        name: 'Repsol Madrid Centro',
        brand: 'Repsol',
        latitude: latitude + 0.01,
        longitude: longitude + 0.01,
        address: 'Calle Mayor, 1, Madrid',
        distance_km: 0.8,
        diesel_price_eur: 1.359,
        gasoline_price_eur: 1.459,
        last_updated: new Date().toISOString(),
      },
      {
        id: 'cepsa_1',
        name: 'CEPSA Madrid',
        brand: 'CEPSA',
        latitude: latitude - 0.01,
        longitude: longitude - 0.01,
        address: 'Paseo de la Castellana, Madrid',
        distance_km: 1.2,
        diesel_price_eur: 1.349,
        gasoline_price_eur: 1.449,
        last_updated: new Date().toISOString(),
      },
      {
        id: 'bp_1',
        name: 'BP Station',
        brand: 'BP',
        latitude: latitude + 0.02,
        longitude: longitude - 0.02,
        address: 'Avenida Diagonal, Barcelona',
        distance_km: 2.1,
        diesel_price_eur: 1.369,
        gasoline_price_eur: 1.469,
        last_updated: new Date().toISOString(),
      },
      {
        id: 'eni_1',
        name: 'Eni Station',
        brand: 'Eni',
        latitude: latitude - 0.02,
        longitude: longitude + 0.02,
        address: 'Gran Vía, Madrid',
        distance_km: 1.5,
        diesel_price_eur: 1.339,
        gasoline_price_eur: 1.439,
        last_updated: new Date().toISOString(),
      },
      {
        id: 'independent_1',
        name: 'Gasolinera Independiente',
        brand: 'Independiente',
        latitude: latitude,
        longitude: longitude,
        address: 'Polígono Industrial, Madrid',
        distance_km: 0.5,
        diesel_price_eur: 1.299,
        gasoline_price_eur: 1.399,
        last_updated: new Date().toISOString(),
      },
    ];
  }
}
