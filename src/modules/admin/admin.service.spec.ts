import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { User, PlanType } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';

describe('AdminService', () => {
  let service: AdminService;
  let mockUserRepo: any;
  let mockProfileRepo: any;

  beforeEach(async () => {
    mockUserRepo = {
      count: jest.fn().mockResolvedValue(0),
      findAndCount: jest.fn().mockResolvedValue([[], 0]),
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
        getCount: jest.fn().mockResolvedValue(0),
      }),
    };

    mockProfileRepo = {
      count: jest.fn().mockResolvedValue(0),
      findOne: jest.fn().mockResolvedValue(null),
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
        getCount: jest.fn().mockResolvedValue(0),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: getRepositoryToken(UserProfile),
          useValue: mockProfileRepo,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardStats', () => {
    it('should return dashboard stats', async () => {
      const result = await service.getDashboardStats();
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('totalUsers');
      expect(result.data).toHaveProperty('byPlan');
      expect(result.data).toHaveProperty('onboarding');
    });
  });

  describe('getSystemHealth', () => {
    it('should return system health status', async () => {
      const result = await service.getSystemHealth();
      expect(result.success).toBe(true);
      expect(result.data.status).toMatch(/healthy|degraded/);
      expect(result.data).toHaveProperty('uptime');
      expect(result.data).toHaveProperty('memory');
      expect(result.data).toHaveProperty('database');
      expect(result.data).toHaveProperty('services');
    });

    it('should have properly formatted uptime', async () => {
      const result = await service.getSystemHealth();
      expect(result.data.uptime).toHaveProperty('seconds');
      expect(result.data.uptime).toHaveProperty('formatted');
      expect(typeof result.data.uptime.seconds).toBe('number');
      expect(typeof result.data.uptime.formatted).toBe('string');
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      const result = await service.getAllUsers(1, 20);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('users');
      expect(result.data).toHaveProperty('pagination');
      expect(result.data.pagination).toHaveProperty('page', 1);
      expect(result.data.pagination).toHaveProperty('limit', 20);
    });
  });

  describe('getUsersByPlan', () => {
    it('should return users grouped by plan', async () => {
      const result = await service.getUsersByPlan();
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('particular');
      expect(result.data).toHaveProperty('empresa');
      expect(result.data).toHaveProperty('total');
    });
  });
});
