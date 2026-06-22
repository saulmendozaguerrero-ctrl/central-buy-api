import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { AuthGuard } from '../../common/guards/auth.guard';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile])],
  providers: [UsersService, AuthGuard],
  controllers: [UsersController],
  exports: [UsersService, TypeOrmModule, AuthGuard],
})
export class UsersModule {}
