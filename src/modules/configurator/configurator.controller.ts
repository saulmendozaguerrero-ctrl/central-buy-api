import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfiguratorService } from './configurator.service';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PlanGuard } from '../../common/guards/plan.guard';
import { PlanRequired } from '../../common/decorators/plan-required.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Configurator')
@Controller('configurator')
@UseGuards(AuthGuard, PlanGuard)
@PlanRequired('particular')
@ApiBearerAuth()
export class ConfiguratorController {
  constructor(private readonly configuratorService: ConfiguratorService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate recommended sale price + optionally save' })
  async calculate(@Body() dto: CalculatePriceDto, @CurrentUser() user: User) {
    return this.configuratorService.calculateAndSave(dto, user.id);
  }

  @Get('saved')
  @ApiOperation({ summary: 'Get my saved price configurations' })
  async getSaved(@CurrentUser() user: User) {
    return this.configuratorService.getSavedConfigs(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a saved price configuration' })
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    await this.configuratorService.deleteConfig(id, user.id);
    return { deleted: true };
  }
}
