import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async register(dto: RegisterDto, clerkUserId: string): Promise<User> {
    const existing = await this.userRepo.findOne({
      where: [{ email: dto.email }, { clerkUserId }],
    });

    if (existing) {
      throw new ConflictException('User already registered');
    }

    const user = this.userRepo.create({
      ...dto,
      clerkUserId,
      role: UserRole.USER,
    });

    return this.userRepo.save(user);
  }

  async getMe(userId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async handleClerkWebhook(event: {
    type: string;
    data: {
      id: string;
      email_addresses: { email_address: string }[];
      first_name?: string;
      last_name?: string;
    };
  }): Promise<void> {
    if (event.type === 'user.deleted') {
      const clerkUserId = event.data.id;
      await this.userRepo.delete({ clerkUserId });
    }
  }
}
