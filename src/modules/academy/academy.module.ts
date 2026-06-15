import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademyController } from './academy.controller';
import { AcademyService } from './academy.service';
import { AcademyContent } from './entities/content.entity';
import { EcoPill } from './entities/eco-pill.entity';
import { EcoQuiz } from './entities/eco-quiz.entity';
import { EcoQuizAttempt } from './entities/eco-quiz-attempt.entity';
import { EcoProgress } from './entities/eco-progress.entity';
import { EcoCertificate } from './entities/eco-certificate.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AcademyContent,
      EcoPill,
      EcoQuiz,
      EcoQuizAttempt,
      EcoProgress,
      EcoCertificate,
      Subscription,
      User,
    ]),
    UsersModule,
  ],
  controllers: [AcademyController],
  providers: [AcademyService],
  exports: [AcademyService],
})
export class AcademyModule {}
