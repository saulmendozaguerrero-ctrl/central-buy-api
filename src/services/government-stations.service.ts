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
      // Usar fetch nativo para mejor compatibilidad
      const response = await fetch(this.GOV_API_URL);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      const stations = this.parseGovernmentData(text);
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
   * Parsear datos en formato JSON del gobierno
   * Formato: {"ListaEESSPrecio": [{"C.P.", "Dirección", "Latitud", "Longitud (WGS84)", "Precio Gasolina 95 E10", "Precio Diésel"}
   */
  private parseGovernmentData(rawData: string): GovernmentStation[] {
    const stations: GovernmentStation[] = [];

    try {
      const json = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      const lista = json.ListaEESSPrecio || [];

      for (const station of lista) {
        // Reemplazar coma por punto en coordenadas españolas
        const latStr = (station.Latitud || '').replace(',', '.');
        const lngStr = (station['Longitud (WGS84)'] || '').replace(',', '.');
        const gaso95 = (station['Precio Gasolina 95 E10'] || '').replace(',', '.');
        const diesel = (station['Precio Diésel'] || '').replace(',', '.');

        const s: GovernmentStation = {
          code: station['C.P.'],
          name: station.Localidad || 'N/A',
          address: station['Dirección'] || 'N/A',
          lat: parseFloat(latStr) || 0,
          lng: parseFloat(lngStr) || 0,
          province: station.Municipio || 'N/A',
          schedule: station.Horario,
          brand: station['Marca de distribuidor'] || 'N/A',
          gasolina: gaso95 ? parseFloat(gaso95) : null,
          diesel: diesel ? parseFloat(diesel) : null,
          updateDate: new Date().toISOString(),
        };

        // Filtrar estaciones sin coordenadas válidas
        if (s.lat !== 0 && s.lng !== 0) {
          stations.push(s);
        }
      }
    } catch (error) {
      this.logger.error(`❌ Error parseando JSON: ${error.message}`);
      return [];
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
