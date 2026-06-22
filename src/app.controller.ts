import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
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

  @Get('test-endpoint')
  @ApiOperation({ summary: 'Test endpoint to verify routing' })
  test(): { message: string } {
    return { message: 'Routing is working!' };
  }
}
