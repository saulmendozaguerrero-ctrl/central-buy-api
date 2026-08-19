import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface GovernmentStation {
  code?: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  province: string;
  schedule?: string;
  brand?: string;
  gasolina: number | null;
  diesel: number | null;
  gasolina95?: number | null;
  biodiesel?: number | null;
  bioetanol?: number | null;
  gas?: number | null;
  updateDate?: string;
}

@Injectable()
export class GovernmentStationsService {
  private readonly logger = new Logger(GovernmentStationsService.name);
  private readonly GOV_API_URL =
    'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';
  private stationsCache: GovernmentStation[] = [];
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 3600000; // 1 hora

  constructor(private readonly httpService: HttpService) {}

  /**
   * Obtener datos del API del gobierno (con cache)
   */
  private async fetchGovernmentData(): Promise<any> {
    const now = Date.now();

    // Si hay cache válido, usar ese
    if (this.stationsCache.length > 0 && now - this.cacheTimestamp < this.CACHE_DURATION) {
      this.logger.log(`✅ Cache válido (${this.stationsCache.length} gasolineras)`);
      return this.stationsCache;
    }

    this.logger.log('📡 Descargando datos del API del gobierno...');

    try {
      // El API devuelve datos en formato texto separado por |
      const response = await firstValueFrom(
        this.httpService.get(this.GOV_API_URL, {
          timeout: 30000,
        })
      );

      const stations = this.parseGovernmentData(response.data);
      this.stationsCache = stations;
      this.cacheTimestamp = now;

      this.logger.log(
        `✅ Descargadas ${stations.length} gasolineras del gobierno`
      );

      return stations;
    } catch (error) {
      this.logger.error(
        `❌ Error descargando datos del gobierno: ${error.message}`
      );

      // Si hay cache expirado, usarlo igualmente
      if (this.stationsCache.length > 0) {
        this.logger.warn(
          `⚠️ Usando cache expirado (${this.stationsCache.length} gasolineras)`
        );
        return this.stationsCache;
      }

      throw new Error(
        `Government stations API failed: ${error.message}`
      );
    }
  }

  /**
   * Parsear datos en formato texto del gobierno
   * Formato: código|nombre|dirección|lat|lng|provincia|horario|marca|gasolina|diésel|...
   */
  private parseGovernmentData(rawData: string): GovernmentStation[] {
    const stations: GovernmentStation[] = [];
    const lines = rawData.split('\n');

    for (const line of lines) {
      if (!line.trim()) continue;

      const parts = line.split('|');

      if (parts.length < 9) continue;

      const station: GovernmentStation = {
        code: parts[0],
        name: parts[1]?.trim() || 'N/A',
        address: parts[2]?.trim() || 'N/A',
        lat: parseFloat(parts[3]) || 0,
        lng: parseFloat(parts[4]) || 0,
        province: parts[5]?.trim() || 'N/A',
        schedule: parts[6]?.trim(),
        brand: parts[7]?.trim(),
        gasolina: parts[8] ? parseFloat(parts[8]) : null,
        diesel: parts[9] ? parseFloat(parts[9]) : null,
        gasolina95: parts[10] ? parseFloat(parts[10]) : null,
        biodiesel: parts[11] ? parseFloat(parts[11]) : null,
        bioetanol: parts[12] ? parseFloat(parts[12]) : null,
        gas: parts[13] ? parseFloat(parts[13]) : null,
        updateDate: new Date().toISOString(),
      };

      // Filtrar estaciones sin coordenadas válidas
      if (station.lat !== 0 && station.lng !== 0) {
        stations.push(station);
      }
    }

    return stations;
  }

  /**
   * Calcular distancia entre dos puntos (Haversine)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en km
  }

  /**
   * Buscar gasolineras cercanas a una ubicación
   */
  async getNearbyStations(
    lat: number,
    lng: number,
    radiusKm: number = 10
  ): Promise<any> {
    const stations = await this.fetchGovernmentData();

    // Filtrar estaciones dentro del radio
    const nearby = stations
      .map((station: any) => ({
        ...station,
        distance: this.calculateDistance(lat, lng, station.lat, station.lng),
      }))
      .filter((station: any) => station.distance <= radiusKm)
      .sort((a: any, b: any) => a.distance - b.distance);

    const avgGasolina =
      nearby.reduce((sum: number, s: any) => sum + (s.gasolina || 0), 0) / nearby.length || null;
    const avgDiesel =
      nearby.reduce((sum: number, s: any) => sum + (s.diesel || 0), 0) / nearby.length || null;

    return {
      status: 'OK',
      search_location: { lat, lng },
      radius_km: radiusKm,
      found: nearby.length,
      avg_prices: {
        gasolina: avgGasolina ? parseFloat(avgGasolina.toFixed(3)) : null,
        diesel: avgDiesel ? parseFloat(avgDiesel.toFixed(3)) : null,
      },
      stations: nearby.slice(0, 50), // Top 50 cercanas
      source: 'Ministerio de Industria, Comercio y Turismo (MINETUR)',
      last_update: stations[0]?.updateDate || new Date().toISOString(),
    };
  }

  /**
   * Obtener TODAS las gasolineras (opcional por provincia)
   */
  async getAllStations(province?: string): Promise<any> {
    let stations = await this.fetchGovernmentData();

    if (province) {
      stations = stations.filter(
        (s: any) => s.province.toLowerCase() === province.toLowerCase()
      );
    }

    return {
      status: 'OK',
      filter: province ? `Province: ${province}` : 'All',
      total: stations.length,
      stations: stations.map((s: any) => ({
        name: s.name,
        address: s.address,
        location: { lat: s.lat, lng: s.lng },
        province: s.province,
        brand: s.brand,
        prices: {
          gasolina: s.gasolina,
          diesel: s.diesel,
          gasolina95: s.gasolina95,
        },
      })),
      source: 'Ministerio de Industria, Comercio y Turismo (MINETUR)',
    };
  }

  /**
   * Estadísticas de precios por producto
   */
  async getPricesByProduct(product: string): Promise<any> {
    const stations = await this.fetchGovernmentData();

    const filterByProduct = (p: string, s: GovernmentStation) => {
      switch (p.toLowerCase()) {
        case 'gasolina':
          return s.gasolina;
        case 'diesel':
          return s.diesel;
        case 'todos':
        default:
          return [s.gasolina, s.diesel].filter((p) => p !== null);
      }
    };

    const prices: number[] = [];
    for (const station of stations) {
      const p = filterByProduct(product, station);
      if (Array.isArray(p)) {
        prices.push(...p);
      } else if (p) {
        prices.push(p);
      }
    }

    prices.sort((a, b) => a - b);

    return {
      status: 'OK',
      product,
      count: prices.length,
      min: prices[0] || null,
      max: prices[prices.length - 1] || null,
      avg: (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(3),
      median: prices[Math.floor(prices.length / 2)],
      percentile_25: prices[Math.floor(prices.length * 0.25)],
      percentile_75: prices[Math.floor(prices.length * 0.75)],
      source: 'Ministerio de Industria, Comercio y Turismo (MINETUR)',
      timestamp: new Date().toISOString(),
    };
  }
}
