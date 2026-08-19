import { Controller, Get, Query, Logger, BadRequestException } from '@nestjs/common';
import { GovernmentStationsService } from '../../services/government-stations.service';

@Controller('api/gov')
export class GovernmentController {
  private readonly logger = new Logger(GovernmentController.name);

  constructor(private readonly govService: GovernmentStationsService) {}

  /**
   * GET /api/gov/stations?lat=40.41&lng=-3.70&radius_km=5
   * Obtener gasolineras reales del Ministerio de Industria (España)
   * 11.507 gasolineras, datos actualizados diariamente
   */
  @Get('stations')
  async getGovernmentStations(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius_km') radiusKm: string = '10'
  ) {
    if (!lat || !lng) {
      throw new BadRequestException('Required: lat, lng');
    }

    this.logger.log(
      `⛽ [GET] /api/gov/stations?lat=${lat}&lng=${lng}&radius_km=${radiusKm}`
    );

    return await this.govService.getNearbyStations(
      parseFloat(lat),
      parseFloat(lng),
      parseInt(radiusKm, 10)
    );
  }

  /**
   * GET /api/gov/stations/all
   * Descargar TODAS las gasolineras (11.507) — use con cuidado
   */
  @Get('stations/all')
  async getAllGovernmentStations(@Query('province') province?: string) {
    this.logger.log(
      `⛽ [GET] /api/gov/stations/all${province ? `?province=${province}` : ''}`
    );

    return await this.govService.getAllStations(province);
  }

  /**
   * GET /api/gov/prices?product=gasolina
   * Precios de gasolina + diésel por región/provincia
   */
  @Get('prices')
  async getPricesByProduct(
    @Query('product') product: string = 'todos'
  ) {
    this.logger.log(
      `💰 [GET] /api/gov/prices?product=${product}`
    );

    return await this.govService.getPricesByProduct(product);
  }
}
