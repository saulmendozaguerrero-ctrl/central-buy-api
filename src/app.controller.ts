import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GovernmentStationsService } from './services/government-stations.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly govService: GovernmentStationsService) {}
  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  health(): { status: string; timestamp: string; version: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  @Get()
  root(): { name: string; docs: string; updated: string; hasConsultations: boolean } {
    return {
      name: 'Central Buy API',
      docs: '/api/docs',
      updated: '2026-06-22T15:00:00Z',
      hasConsultations: true,
    };
  }

  @Post('test-consultation')
  @ApiOperation({ summary: 'Test consultation endpoint in app.controller' })
  testConsultation() {
    return {
      success: true,
      message: 'Test consultation from AppController',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('api/gov/stations')
  @ApiOperation({ summary: 'Government petrol stations' })
  async getGovStations(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius_km') radiusKm: string = '10'
  ) {
    return await this.govService.getNearbyStations(
      parseFloat(lat),
      parseFloat(lng),
      parseInt(radiusKm, 10)
    );
  }
}
