import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Optional,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AcademyService } from './academy.service';
import { CreateContentDto } from './dto/create-content.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { SubscriptionPlan } from '../subscriptions/entities/subscription.entity';

@ApiTags('Academy')
@Controller('academy')
export class AcademyController {
  constructor(private readonly academyService: AcademyService) {}

  @Get('content')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List published content (filtered by plan)' })
  async getAll(@CurrentUser() user: User) {
    return this.academyService.getAll(user.planType as unknown as SubscriptionPlan);
  }

  @Get('content/:slug')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get content by slug' })
  async getBySlug(@Param('slug') slug: string) {
    return this.academyService.getBySlug(slug);
  }

  @Get('categories')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List content categories' })
  async getCategories() {
    return this.academyService.getCategories();
  }

  @Post('content')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Create academy content' })
  async create(@Body() dto: CreateContentDto) {
    return this.academyService.create(dto);
  }

  @Patch('content/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Update academy content' })
  async update(@Param('id') id: string, @Body() dto: Partial<CreateContentDto>) {
    return this.academyService.update(id, dto);
  }

  @Delete('content/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Delete content' })
  async delete(@Param('id') id: string) {
    await this.academyService.delete(id);
    return { deleted: true };
  }
}
