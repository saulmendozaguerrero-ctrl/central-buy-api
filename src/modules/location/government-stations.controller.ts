import { Controller, Get, Query, Logger, BadRequestException } from '@nestjs/common';
import { GovernmentStationsService } from '../../services/government-stations.service';

@Controller('api/location')
export class GovernmentStationsController {
  private readonly logger = new Logger(GovernmentStationsController.name);

  constructor(private readonly govService: GovernmentStationsService) {}

  /**
   * GET /api/location/government-stations
   * Obtener gasolineras reales del Ministerio de Industria (España)
   * 11.507 gasolineras, datos actualizados diariamente
   * Query: lat, lng, radius_km (default 10)
   */
  @Get('government-stations')
  async getGovernmentStations(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius_km') radiusKm: string = '10'
  ) {
    if (!lat || !lng) {
      throw new BadRequestException('Required: lat, lng');
    }

    this.logger.log(
      `⛽ [GET] /api/location/government-stations?lat=${lat}&lng=${lng}&radius_km=${radiusKm}`
    );

    return await this.govService.getNearbyStations(
      parseFloat(lat),
      parseFloat(lng),
      parseInt(radiusKm, 10)
    );
  }

  /**
   * GET /api/location/government-stations/all
   * Descargar TODAS las gasolineras (11.507) — use con cuidado
   * Opcional: filter por provincia
   */
  @Get('government-stations/all')
  async getAllGovernmentStations(@Query('province') province?: string) {
    this.logger.log(
      `⛽ [GET] /api/location/government-stations/all${province ? `?province=${province}` : ''}`
    );

    return await this.govService.getAllStations(province);
  }

  /**
   * GET /api/location/government-stations/prices
   * Precios de gasolina + diésel por región/provincia
   * Query: product (gasolina|diesel|todos)
   */
  @Get('government-stations/prices')
  async getPricesByProduct(
    @Query('product') product: string = 'todos'
  ) {
    this.logger.log(
      `💰 [GET] /api/location/government-stations/prices?product=${product}`
    );

    return await this.govService.getPricesByProduct(product);
  }
}
