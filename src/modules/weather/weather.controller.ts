import { Controller, Get, Query, Logger } from '@nestjs/common';
import { WeatherService } from '../../services/weather.service';

@Controller('api/weather')
export class WeatherController {
  private readonly logger = new Logger(WeatherController.name);

  constructor(private readonly weatherService: WeatherService) {}

  /**
   * GET /api/weather/forecast
   * Obtener clima actual + pronóstico 24h + recomendación de viaje
   */
  @Get('forecast')
  async getWeatherForecast(
    @Query('lat') latitude: string,
    @Query('lng') longitude: string,
  ) {
    this.logger.log(`🌤️ Obteniendo clima para lat=${latitude}, lng=${longitude}`);

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return {
        status: 'error',
        message: 'Invalid coordinates',
        data: null,
      };
    }

    const weatherData = await this.weatherService.getWeatherForecast(lat, lng);

    return {
      status: 'success',
      data: weatherData,
    };
  }

  /**
   * GET /api/weather/travel-score
   * Solo obtener score de viaje (ligero)
   */
  @Get('travel-score')
  async getTravelScore(
    @Query('lat') latitude: string,
    @Query('lng') longitude: string,
  ) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    const weatherData = await this.weatherService.getWeatherForecast(lat, lng);

    return {
      status: 'success',
      data: {
        score: weatherData.travel_recommendation.score,
        best_time: weatherData.travel_recommendation.best_time,
        conditions: weatherData.travel_recommendation.conditions,
        warnings: weatherData.travel_recommendation.warnings,
        timestamp: weatherData.timestamp,
      },
    };
  }
}
