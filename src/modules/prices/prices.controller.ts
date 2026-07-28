import { Controller, Get, Query, Logger } from '@nestjs/common';
import { PricesService } from '../../services/prices.service';

@Controller('api/prices')
export class PricesController {
  private readonly logger = new Logger(PricesController.name);

  constructor(private readonly pricesService: PricesService) {}

  /**
   * GET /api/prices/market-data
   * Obtener datos de mercado en tiempo real
   * Incluye: Brent, WTI, precios spot gasolina y diésel
   */
  @Get('market-data')
  async getMarketData() {
    this.logger.log('📊 [GET] /api/prices/market-data');
    return await this.pricesService.getMarketData();
  }

  /**
   * GET /api/prices/platts-daily
   * Obtener datos Platts diarios
   * En Mes 1: manual. En Mes 2+: API directa
   */
  @Get('platts-daily')
  async getPlattsDaily() {
    this.logger.log('📋 [GET] /api/prices/platts-daily');
    return await this.pricesService.getPlattsDaily();
  }
}
