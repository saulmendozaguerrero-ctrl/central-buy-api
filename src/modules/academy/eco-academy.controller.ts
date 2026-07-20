import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AcademyService } from './academy.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { EcoAcademyProgressDto } from './dto/eco-academy-progress.dto';
import { CreateEcoPillDto } from './dto/create-eco-pill.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Eco-Academy')
@Controller('eco-academy')
export class EcoAcademyController {
  constructor(private readonly academyService: AcademyService) {}

  @Get('pills')
  @ApiOperation({ summary: 'List eco-academy pills (public)' })
  async getEcoPills(@Query('category') category?: string) {
    return this.academyService.getEcoPills(category);
  }

  @Get('pills/:id')
  @ApiOperation({ summary: 'Get eco-pill detail with associated quizzes' })
  async getEcoPillDetail(@Param('id') id: string) {
    return this.academyService.getEcoPillDetail(id);
  }

  @Get('quiz/:quizId')
  @ApiOperation({ summary: 'Get quiz details for completion' })
  async getEcoQuizDetail(@Param('quizId') quizId: string) {
    return this.academyService.getEcoQuizDetail(quizId);
  }

  @Get('progress')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user eco-academy progress' })
  async getEcoProgress(@CurrentUser() user: User) {
    return this.academyService.getEcoProgress(user.id);
  }

  @Post('quiz-attempts')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit quiz attempt with server-side validation' })
  async submitQuizAttempt(@CurrentUser() user: User, @Body() dto: SubmitQuizDto) {
    return this.academyService.submitQuizAttempt(user.id, dto);
  }

  @Post('progress')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark eco-pill as completed' })
  async markPillCompleted(
    @CurrentUser() user: User,
    @Body() dto: EcoAcademyProgressDto,
  ) {
    return this.academyService.markPillCompleted(user.id, dto);
  }

  @Post('pills')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new eco-pill (admin only)' })
  async createPill(@CurrentUser() user: User, @Body() dto: CreateEcoPillDto, @Req() req: any) {
    // Check admin role
    if ((user as any).role !== 'admin') {
      throw new ForbiddenException('Admin access required to create pills');
    }
    return this.academyService.createEcoPill(dto);
  }
}
