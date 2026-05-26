import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademyController } from './academy.controller';
import { AcademyService } from './academy.service';
import { AcademyContent } from './entities/content.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([AcademyContent, Subscription, User]), UsersModule],
  controllers: [AcademyController],
  providers: [AcademyService],
  exports: [AcademyService],
})
export class AcademyModule {}
