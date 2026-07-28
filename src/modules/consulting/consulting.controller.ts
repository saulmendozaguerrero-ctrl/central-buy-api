import { Controller, Get, Query, Logger } from '@nestjs/common';
import { PricesService } from '../../services/prices.service';

@Controller('api/consulting')
export class ConsultingController {
  private readonly logger = new Logger(ConsultingController.name);

  constructor(private readonly pricesService: PricesService) {}

  /**
   * GET /api/consulting/forecast-24h
   * Pronóstico de precios para las próximas 24 horas
   * Útil para planificar repostaje
   */
  @Get('forecast-24h')
  async getForecast24h() {
    this.logger.log('🔮 [GET] /api/consulting/forecast-24h');
    return await this.pricesService.getForecast24h();
  }

  /**
   * GET /api/consulting/recommendation
   * Obtener recomendación: ¿cuándo repostar?
   * Query: liters (cantidad a repostar, default 50)
   */
  @Get('recommendation')
  async getRecommendation(@Query('liters') liters: string = '50') {
    this.logger.log(
      `💡 [GET] /api/consulting/recommendation?liters=${liters}`
    );
    return await this.pricesService.getRecommendation(parseInt(liters, 10));
  }
}
