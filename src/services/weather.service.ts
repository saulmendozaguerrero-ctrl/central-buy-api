import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

interface WeatherData {
  location: {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
  };
  current: {
    temperature_celsius: number;
    feels_like_celsius: number;
    humidity_percent: number;
    pressure_mb: number;
    wind_speed_kmh: number;
    wind_direction_degrees: number;
    precipitation_mm: number;
    cloudiness_percent: number;
    visibility_km: number;
    condition: string;
    icon: string;
  };
  forecast_24h: Array<{
    hour: number;
    temperature_celsius: number;
    precipitation_chance: number;
    wind_speed_kmh: number;
  }>;
  travel_recommendation: {
    score: number; // 0-100
    best_time_to_travel: string;
    conditions: string[];
    warnings: string[];
  };
  timestamp: string;
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly OPENWEATHER_API = 'https://api.openweathermap.org/data/2.5';
  private readonly openWeatherApiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.openWeatherApiKey = this.configService.get<string>('OPENWEATHER_API_KEY') || 'demo';
  }

  /**
   * Obtener clima actual + pronóstico 24h
   */
  async getWeatherForecast(latitude: number, longitude: number): Promise<WeatherData> {
    this.logger.log(`🌤️ Obteniendo clima para ${latitude}, ${longitude}`);
    this.logger.log(`API Key present: ${this.openWeatherApiKey ? 'YES' : 'NO (usando mock)'}`);

    try {
      // Si no hay API key, usar mock directamente
      if (!this.openWeatherApiKey || this.openWeatherApiKey === 'demo') {
        this.logger.warn('⚠️ OpenWeather API key not configured, using mock data');
        return this.getMockWeatherData(latitude, longitude);
      }

      // Obtener clima actual + forecast
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(`${this.OPENWEATHER_API}/forecast`, {
          params: {
            lat: latitude,
            lon: longitude,
            units: 'metric',
            appid: this.openWeatherApiKey,
            lang: 'es',
          },
          timeout: 5000,
        }),
      );

      const data = response.data;
      const current = data.list[0]; // Primer forecast (actual)
      const city = data.city.name;
      const country = data.city.country;

      // Generar pronóstico 24h
      const forecast24h = data.list.slice(0, 8).map((item: any, index: number) => ({
        hour: (index * 3) % 24,
        temperature_celsius: item.main.temp,
        precipitation_chance: item.pop * 100,
        wind_speed_kmh: item.wind.speed * 3.6, // m/s to km/h
      }));

      // Calcular recomendación de viaje
      const travelScore = this.calculateTravelScore(current, forecast24h);

      this.logger.log(`✅ Clima obtenido: ${current.main.temp}°C, ${current.weather[0].main}`);

      return {
        location: {
          latitude,
          longitude,
          city,
          country,
        },
        current: {
          temperature_celsius: current.main.temp,
          feels_like_celsius: current.main.feels_like,
          humidity_percent: current.main.humidity,
          pressure_mb: current.main.pressure,
          wind_speed_kmh: current.wind.speed * 3.6,
          wind_direction_degrees: current.wind.deg || 0,
          precipitation_mm: current.rain?.['3h'] || 0,
          cloudiness_percent: current.clouds.all,
          visibility_km: (current.visibility || 10000) / 1000,
          condition: current.weather[0].main,
          icon: current.weather[0].icon,
        },
        forecast_24h,
        travel_recommendation: {
          score: travelScore.score,
          best_time_to_travel: travelScore.best_time,
          conditions: travelScore.conditions,
          warnings: travelScore.warnings,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`❌ Error fetching weather: ${error.message}`);

      // Fallback: Mock weather data
      return this.getMockWeatherData(latitude, longitude);
    }
  }

  /**
   * Calcular score de viaje (0-100) basado en clima
   */
  private calculateTravelScore(
    current: any,
    forecast24h: any[],
  ): {
    score: number;
    best_time: string;
    conditions: string[];
    warnings: string[];
  } {
    let score = 100;
    const conditions: string[] = [];
    const warnings: string[] = [];

    // Factor temperatura
    const temp = current.main.temp;
    if (temp < 0) {
      score -= 30;
      warnings.push('Temperatura bajo cero - Cuidado con hielo');
    } else if (temp > 35) {
      score -= 20;
      warnings.push('Calor extremo - Riesgo deshidratación');
    } else if (temp >= 15 && temp <= 25) {
      conditions.push('Temperatura ideal para viajar');
    }

    // Factor lluvia
    if (current.rain?.['3h'] > 10) {
      score -= 25;
      warnings.push('Lluvia fuerte - Reducir velocidad');
    } else if (current.rain?.['3h'] > 5) {
      score -= 15;
      warnings.push('Lluvia moderada - Precaución');
    }

    // Factor viento
    const windSpeed = current.wind.speed * 3.6;
    if (windSpeed > 50) {
      score -= 20;
      warnings.push('Viento fuerte - Afecta combustible');
    }

    // Factor visibilidad
    const visibility = (current.visibility || 10000) / 1000;
    if (visibility < 2) {
      score -= 30;
      warnings.push('Visibilidad muy reducida');
    } else if (visibility < 5) {
      score -= 15;
      warnings.push('Niebla - Usar luces');
    }

    // Buscar mejor hora en próximas 24h
    const bestHour = forecast24h.reduce((best, hour) => {
      return hour.precipitation_chance < best.precipitation_chance ? hour : best;
    });

    const bestTime =
      bestHour.hour === 0
        ? 'Medianoche'
        : bestHour.hour < 12
          ? `Mañana ${bestHour.hour}:00`
          : `Tarde ${bestHour.hour}:00`;

    return {
      score: Math.max(0, score),
      best_time: bestTime,
      conditions,
      warnings,
    };
  }

  /**
   * Mock weather data para fallback
   */
  private getMockWeatherData(latitude: number, longitude: number): WeatherData {
    return {
      location: {
        latitude,
        longitude,
        city: 'Madrid',
        country: 'ES',
      },
      current: {
        temperature_celsius: 28,
        feels_like_celsius: 30,
        humidity_percent: 45,
        pressure_mb: 1013,
        wind_speed_kmh: 12,
        wind_direction_degrees: 180,
        precipitation_mm: 0,
        cloudiness_percent: 20,
        visibility_km: 10,
        condition: 'Despejado',
        icon: '01d',
      },
      forecast_24h: [
        { hour: 0, temperature_celsius: 26, precipitation_chance: 5, wind_speed_kmh: 10 },
        { hour: 3, temperature_celsius: 24, precipitation_chance: 8, wind_speed_kmh: 9 },
        { hour: 6, temperature_celsius: 22, precipitation_chance: 12, wind_speed_kmh: 8 },
        { hour: 9, temperature_celsius: 25, precipitation_chance: 5, wind_speed_kmh: 10 },
        { hour: 12, temperature_celsius: 30, precipitation_chance: 2, wind_speed_kmh: 12 },
        { hour: 15, temperature_celsius: 31, precipitation_chance: 0, wind_speed_kmh: 14 },
        { hour: 18, temperature_celsius: 28, precipitation_chance: 3, wind_speed_kmh: 11 },
        { hour: 21, temperature_celsius: 25, precipitation_chance: 15, wind_speed_kmh: 9 },
      ],
      travel_recommendation: {
        score: 92,
        best_time_to_travel: 'Tarde 15:00',
        conditions: ['Temperatura ideal', 'Buena visibilidad'],
        warnings: [],
      },
      timestamp: new Date().toISOString(),
    };
  }
}
