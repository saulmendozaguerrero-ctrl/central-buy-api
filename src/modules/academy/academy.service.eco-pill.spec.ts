import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AcademyService } from './academy.service';
import { AcademyContent } from './entities/content.entity';
import { EcoPill, EcoPillCategory, EcoDifficulty } from './entities/eco-pill.entity';
import { EcoQuiz } from './entities/eco-quiz.entity';
import { EcoQuizAttempt } from './entities/eco-quiz-attempt.entity';
import { EcoProgress } from './entities/eco-progress.entity';
import { EcoCertificate } from './entities/eco-certificate.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateEcoPillDto } from './dto/create-eco-pill.dto';

describe('AcademyService - Eco Pills', () => {
  let service: AcademyService;
  let mockContentRepo: any;
  let mockEcoPillRepo: any;
  let mockEcoQuizRepo: any;
  let mockEcoAttemptRepo: any;
  let mockEcoProgressRepo: any;
  let mockEcoCertificateRepo: any;

  beforeEach(async () => {
    mockContentRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }),
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve(data)),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    mockEcoPillRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((data) => ({ id: 'uuid', ...data })),
      save: jest.fn((data) => Promise.resolve(data)),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }),
    };

    mockEcoQuizRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }),
      findOne: jest.fn().mockResolvedValue(null),
    };

    mockEcoAttemptRepo = {
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve(data)),
      findOne: jest.fn().mockResolvedValue(null),
    };

    mockEcoProgressRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve(data)),
    };

    mockEcoCertificateRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve(data)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcademyService,
        {
          provide: getRepositoryToken(AcademyContent),
          useValue: mockContentRepo,
        },
        {
          provide: getRepositoryToken(EcoPill),
          useValue: mockEcoPillRepo,
        },
        {
          provide: getRepositoryToken(EcoQuiz),
          useValue: mockEcoQuizRepo,
        },
        {
          provide: getRepositoryToken(EcoQuizAttempt),
          useValue: mockEcoAttemptRepo,
        },
        {
          provide: getRepositoryToken(EcoProgress),
          useValue: mockEcoProgressRepo,
        },
        {
          provide: getRepositoryToken(EcoCertificate),
          useValue: mockEcoCertificateRepo,
        },
      ],
    }).compile();

    service = module.get<AcademyService>(AcademyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEcoPills', () => {
    it('should return eco pills', async () => {
      const mockPills = [
        {
          id: '1',
          title: 'Eco Driving 101',
          slug: 'eco-driving-101',
        },
      ];
      mockEcoPillRepo.createQueryBuilder().getMany.mockResolvedValue(mockPills);

      const result = await service.getEcoPills();
      expect(result).toEqual(mockPills);
    });
  });

  describe('createEcoPill', () => {
    it('should create a new eco pill', async () => {
      const dto: CreateEcoPillDto = {
        title: 'Eco Driving 101',
        slug: 'eco-driving-101',
        category: EcoPillCategory.ECO_DRIVING,
        difficulty: EcoDifficulty.BEGINNER,
        content: 'Learn eco driving basics',
      };

      mockEcoPillRepo.findOne.mockResolvedValue(null);
      const savedPill = { id: 'uuid', ...dto };
      mockEcoPillRepo.save.mockResolvedValue(savedPill);

      const result = await service.createEcoPill(dto);
      expect(result).toHaveProperty('id');
      expect(result.title).toBe(dto.title);
      expect(result.slug).toBe(dto.slug);
    });

    it('should throw error if slug already exists', async () => {
      const dto: CreateEcoPillDto = {
        title: 'Eco Driving 101',
        slug: 'eco-driving-101',
      };

      mockEcoPillRepo.findOne.mockResolvedValue({ id: 'existing-id', slug: 'eco-driving-101' });

      await expect(service.createEcoPill(dto)).rejects.toThrow(BadRequestException);
    });

    it('should generate slug from title if not provided', async () => {
      const dto: CreateEcoPillDto = {
        title: 'Eco Driving Advanced',
      };

      mockEcoPillRepo.findOne.mockResolvedValue(null);
      const savedPill = { id: 'uuid', slug: 'eco-driving-advanced', ...dto };
      mockEcoPillRepo.save.mockResolvedValue(savedPill);

      const result = await service.createEcoPill(dto);
      expect(result.slug).toBe('eco-driving-advanced');
    });

    it('should set default values', async () => {
      const dto: CreateEcoPillDto = {
        title: 'Simple Pill',
      };

      mockEcoPillRepo.findOne.mockResolvedValue(null);

      await service.createEcoPill(dto);

      const createCall = mockEcoPillRepo.create.mock.calls[0][0];
      expect(createCall.category).toBe(EcoPillCategory.ECO_DRIVING);
      expect(createCall.difficulty).toBe(EcoDifficulty.BEGINNER);
      expect(createCall.accessLevel).toBe('empresa');
      expect(createCall.published).toBe(true);
    });
  });

  describe('getEcoPillDetail', () => {
    it('should return pill detail with quizzes', async () => {
      const mockPill = {
        id: '1',
        title: 'Eco Driving 101',
        slug: 'eco-driving-101',
        quizzes: [],
      };

      mockEcoPillRepo.findOne.mockResolvedValue(mockPill);
      mockEcoQuizRepo.createQueryBuilder().getMany.mockResolvedValue([]);

      const result = await service.getEcoPillDetail('1');
      expect(result).toHaveProperty('id', '1');
      expect(result).toHaveProperty('quizzes');
    });

    it('should throw error if pill not found', async () => {
      mockEcoPillRepo.findOne.mockResolvedValue(null);

      await expect(service.getEcoPillDetail('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
