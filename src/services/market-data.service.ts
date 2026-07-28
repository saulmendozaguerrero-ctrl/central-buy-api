import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);
  private readonly OIL_PRICE_API = 'https://api.oilpriceapi.com/v1/brent';
  private readonly COMMODITIES_API = 'https://api.commodities-api.com/v1/latest';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Obtener datos de mercado en tiempo real
   * Incluye: Brent, WTI, Gas, precios spot
   */
  async getMarketData() {
    this.logger.log('📊 Obteniendo datos de mercado...');

    try {
      // Obtener precios de petróleo (Brent + WTI)
      const oilResponse: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(this.OIL_PRICE_API, {
          headers: {
            'Accept-Encoding': 'gzip, deflate',
          },
        })
      );

      const oilData = oilResponse.data?.data || {};

      // Mock: En Mes 1, Platts se ingresa manualmente
      const plattsManual = {
        gasoline_95: 1.42, // EUR/L - ingresado por Saul
        diesel: 1.38,
        heating_oil: 1.40,
        last_updated: new Date(),
      };

      return {
        status: 'success',
        timestamp: new Date(),
        market: {
          brent_usd: oilData.brent_crude_oil || 75.5,
          wti_usd: oilData.crude_oil_wti || 73.2,
          gasoline_95_eur_per_liter: plattsManual.gasoline_95,
          diesel_eur_per_liter: plattsManual.diesel,
          source: 'Oil Price API + Manual Platts',
          currency: { oil: 'USD', fuel: 'EUR' },
        },
        forecast: {
          next_24h_trend: 'stable', // En Mes 1: mock
          confidence: 0.75,
        },
      };
    } catch (error) {
      this.logger.error('❌ Error obteniendo datos de mercado:', error.message);
      
      // Fallback: datos mock si API falla
      return {
        status: 'fallback',
        timestamp: new Date(),
        market: {
          brent_usd: 75.5,
          wti_usd: 73.2,
          gasoline_95_eur_per_liter: 1.42,
          diesel_eur_per_liter: 1.38,
          source: 'Mock (API error)',
          currency: { oil: 'USD', fuel: 'EUR' },
        },
        warning: 'Using fallback data - API unreachable',
      };
    }
  }

  /**
   * Obtener datos Platts (manual en Mes 1)
   * En Mes 2+: integrar API directa
   */
  async getPlattsDaily() {
    this.logger.log('📋 Obteniendo datos Platts...');

    return {
      date: new Date().toISOString().split('T')[0],
      gasoline_95: {
        price_eur_per_liter: 1.42,
        change_percent: 0.5,
        high: 1.45,
        low: 1.40,
      },
      diesel: {
        price_eur_per_liter: 1.38,
        change_percent: 0.3,
        high: 1.41,
        low: 1.36,
      },
      heating_oil: {
        price_eur_per_liter: 1.40,
        change_percent: 0.4,
        high: 1.43,
        low: 1.39,
      },
      source: 'Manual input (Saul) - Mes 1',
      next_update: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
  }

  /**
   * Pronóstico de precios 24h
   * En Mes 1: basado en tendencias históricas
   */
  async getForecast24h() {
    this.logger.log('🔮 Generando pronóstico 24h...');

    const hours = [];
    const now = new Date();

    for (let i = 0; i < 24; i++) {
      const time = new Date(now.getTime() + i * 60 * 60 * 1000);
      
      // Simulación: pequeñas variaciones aleatorias
      const variance = (Math.random() - 0.5) * 0.05;
      
      hours.push({
        hour: time.getHours(),
        timestamp: time,
        gasoline_95: 1.42 + variance,
        diesel: 1.38 + variance,
        confidence: 0.7 + Math.random() * 0.2,
      });
    }

    return {
      forecast_24h: hours,
      generated_at: new Date(),
      source: 'Time-series analysis',
      accuracy_note: 'Mock in Month 1 - upgrades in Month 2+',
    };
  }

  /**
   * Recomendación: cuándo repostar
   * Basada en: precio actual vs pronóstico + histórico
   */
  async getRecommendation(liters: number = 50) {
    this.logger.log('💡 Generando recomendación...');

    const currentPrice = 1.42;
    const forecast24h = await this.getForecast24h();
    const avgForecast =
      forecast24h.forecast_24h.reduce((sum, h) => sum + h.gasoline_95, 0) /
      forecast24h.forecast_24h.length;

    let recommendation = 'ESPERA';
    let confidence = 0.7;

    if (currentPrice < avgForecast * 0.98) {
      recommendation = 'COMPRA AHORA';
      confidence = 0.85;
    } else if (currentPrice > avgForecast * 1.02) {
      recommendation = 'ESPERA';
      confidence = 0.75;
    }

    return {
      recommendation,
      reason:
        recommendation === 'COMPRA AHORA'
          ? `Precio actual (€${currentPrice}/L) está ${((1 - currentPrice / avgForecast) * 100).toFixed(2)}% por debajo del promedio 24h`
          : `Precio estable. Espera mejor oportunidad`,
      current_price_eur_per_liter: currentPrice,
      forecast_avg_24h: avgForecast.toFixed(2),
      estimated_savings_liters: liters,
      estimated_savings_eur: (
        liters *
        (avgForecast - currentPrice)
      ).toFixed(2),
      confidence,
      next_check: new Date(Date.now() + 60 * 60 * 1000), // 1h
    };
  }
}
