import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { AuthGuard } from '../../common/guards/auth.guard';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, AuthGuard],
  exports: [UsersService, TypeOrmModule, AuthGuard],
})
export class UsersModule {}
