import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User, PlanType } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UserProfile)
    private profileRepo: Repository<UserProfile>,
  ) {}

  async getDashboardStats() {
    const totalUsers = await this.userRepo.count();
    const particularUsers = await this.userRepo.count({
      where: { planType: PlanType.PARTICULAR },
    });
    const empresaUsers = await this.userRepo.count({
      where: { planType: PlanType.EMPRESA },
    });

    const completedOnboarding = await this.profileRepo.count({
      where: { onboardingCompleted: true },
    });

    return {
      success: true,
      data: {
        totalUsers,
        byPlan: {
          particular: particularUsers,
          empresa: empresaUsers,
        },
        onboarding: {
          completed: completedOnboarding,
          pending: totalUsers - completedOnboarding,
          completionRate: `${((completedOnboarding / totalUsers) * 100).toFixed(1)}%`,
        },
        timestamp: new Date().toISOString(),
      },
    };
  }

  async getAllUsers(page: number = 1, limit: number = 20) {
    const [users, total] = await this.userRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const enriched = await Promise.all(
      users.map(async (user) => {
        const profile = await this.profileRepo.findOne({
          where: { userId: user.id },
        });
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          planType: user.planType,
          onboardingCompleted: profile?.onboardingCompleted || false,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      }),
    );

    return {
      success: true,
      data: {
        users: enriched,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  async getUsersByPlan() {
    const particular = await this.userRepo.count({
      where: { planType: PlanType.PARTICULAR },
    });
    const empresa = await this.userRepo.count({
      where: { planType: PlanType.EMPRESA },
    });

    const total = particular + empresa;

    return {
      success: true,
      data: {
        particular: {
          count: particular,
          percentage: `${((particular / total) * 100).toFixed(1)}%`,
        },
        empresa: {
          count: empresa,
          percentage: `${((empresa / total) * 100).toFixed(1)}%`,
        },
        total,
      },
    };
  }

  async getUsageReport(days: number = 30) {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const newUsers = await this.userRepo.count({
      where: { createdAt: MoreThan(sinceDate) },
    });

    const particularNewUsers = await this.userRepo.count({
      where: {
        planType: PlanType.PARTICULAR,
        createdAt: MoreThan(sinceDate),
      },
    });

    const empresaNewUsers = await this.userRepo.count({
      where: {
        planType: PlanType.EMPRESA,
        createdAt: MoreThan(sinceDate),
      },
    });

    const totalUsers = await this.userRepo.count();

    return {
      success: true,
      data: {
        period: `Last ${days} days`,
        newUsers,
        byPlan: {
          particular: particularNewUsers,
          empresa: empresaNewUsers,
        },
        totalActiveUsers: totalUsers,
        timestamp: new Date().toISOString(),
      },
    };
  }

  async getRevenueReport() {
    const empresaUsers = await this.userRepo.count({
      where: { planType: PlanType.EMPRESA },
    });
    const particularUsers = await this.userRepo.count({
      where: { planType: PlanType.PARTICULAR },
    });

    // Mock revenue (€9.99/mes empresa, €4.99/mes particular)
    const mockEmpresaMRR = empresaUsers * 9.99;
    const mockParticularMRR = particularUsers * 4.99;
    const totalMRR = mockEmpresaMRR + mockParticularMRR;

    return {
      success: true,
      data: {
        mrrByPlan: {
          empresa: `€${mockEmpresaMRR.toFixed(2)}`,
          particular: `€${mockParticularMRR.toFixed(2)}`,
        },
        totalMRR: `€${totalMRR.toFixed(2)}`,
        users: {
          empresa: empresaUsers,
          particular: particularUsers,
        },
        note: 'Mock data based on plan types. Connect Stripe for real revenue.',
        timestamp: new Date().toISOString(),
      },
    };
  }

  async getOnboardingReport() {
    const total = await this.profileRepo.count();
    const completed = await this.profileRepo.count({
      where: { onboardingCompleted: true },
    });

    const particularProfiles = await this.profileRepo
      .createQueryBuilder('p')
      .leftJoin(User, 'u', 'u.id = p.userId')
      .where('u.planType = :plan', { plan: PlanType.PARTICULAR })
      .getCount();

    const particularCompleted = await this.profileRepo
      .createQueryBuilder('p')
      .leftJoin(User, 'u', 'u.id = p.userId')
      .where('u.planType = :plan', { plan: PlanType.PARTICULAR })
      .andWhere('p.onboardingCompleted = true')
      .getCount();

    return {
      success: true,
      data: {
        overall: {
          total,
          completed,
          pending: total - completed,
          completionRate: `${((completed / total) * 100).toFixed(1)}%`,
        },
        byPlan: {
          particular: {
            total: particularProfiles,
            completed: particularCompleted,
            completionRate: `${((particularCompleted / particularProfiles) * 100).toFixed(1)}%`,
          },
        },
        timestamp: new Date().toISOString(),
      },
    };
  }
}
