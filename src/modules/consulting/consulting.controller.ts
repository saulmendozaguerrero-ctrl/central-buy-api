import { Controller, Get, Query, Logger } from '@nestjs/common';
import { MarketDataService } from '../../services/market-data.service';

@Controller('api/consulting')
export class ConsultingController {
  private readonly logger = new Logger(ConsultingController.name);

  constructor(private readonly marketDataService: MarketDataService) {}

  @Get('market-data')
  async getMarketData() {
    this.logger.log('📊 [GET] /api/consulting/market-data');
    return await this.marketDataService.getMarketData();
  }

  @Get('platts-daily')
  async getPlattsDaily() {
    this.logger.log('📋 [GET] /api/consulting/platts-daily');
    return await this.marketDataService.getPlattsDaily();
  }

  @Get('forecast-24h')
  async getForecast24h() {
    this.logger.log('🔮 [GET] /api/consulting/forecast-24h');
    return await this.marketDataService.getForecast24h();
  }

  @Get('recommendation')
  async getRecommendation(@Query('liters') liters: string = '50') {
    this.logger.log(`💡 [GET] /api/consulting/recommendation?liters=${liters}`);
    return await this.marketDataService.getRecommendation(parseInt(liters, 10));
  }
}
