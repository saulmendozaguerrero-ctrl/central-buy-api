import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, PlanType } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly profileRepo: Repository<UserProfile>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByClerkId(clerkUserId: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { clerkUserId } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.userRepo.update(id, dto);
    return this.findById(id);
  }

  async createUserWithPlan(clerkUserId: string, email: string, name: string, planType: PlanType): Promise<User> {
    const user = this.userRepo.create({
      clerkUserId,
      email,
      name,
      planType,
    });
    const savedUser = await this.userRepo.save(user);
    
    // Crear UserProfile automáticamente
    const profile = this.profileRepo.create({
      userId: savedUser.id,
      onboardingCompleted: false,
    });
    await this.profileRepo.save(profile);
    
    return savedUser;
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    return this.profileRepo.findOne({ where: { userId } });
  }

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
    await this.profileRepo.update({ userId }, data);
    return this.getProfile(userId);
  }

  async completedOnboarding(userId: string): Promise<void> {
    await this.profileRepo.update({ userId }, { onboardingCompleted: true });
  }

  async changePlan(userId: string, newPlan: PlanType): Promise<User> {
    await this.userRepo.update(userId, { planType: newPlan });
    return this.findById(userId);
  }

  async findAll(page = 1, limit = 20): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.userRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { users, total };
  }
}
