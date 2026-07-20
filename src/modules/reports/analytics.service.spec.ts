import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { FuelPrice } from '../prices/entities/fuel-price.entity';
import { FuelLog } from '../fleet/entities/fuel-log.entity';
import { Vehicle } from '../fleet/entities/vehicle.entity';
import { User } from '../users/entities/user.entity';
import { BadRequestException } from '@nestjs/common';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let mockFuelPriceRepo: any;
  let mockFuelLogRepo: any;
  let mockVehicleRepo: any;
  let mockUserRepo: any;

  beforeEach(async () => {
    mockFuelPriceRepo = {
      find: jest.fn().mockResolvedValue([]),
    };
    mockFuelLogRepo = {
      find: jest.fn().mockResolvedValue([]),
    };
    mockVehicleRepo = {
      find: jest.fn().mockResolvedValue([]),
    };
    mockUserRepo = {
      findOne: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(FuelPrice),
          useValue: mockFuelPriceRepo,
        },
        {
          provide: getRepositoryToken(FuelLog),
          useValue: mockFuelLogRepo,
        },
        {
          provide: getRepositoryToken(Vehicle),
          useValue: mockVehicleRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPricesHistory', () => {
    it('should throw error if days is not 30, 60, or 90', async () => {
      await expect(service.getPricesHistory('user-id', 45)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return empty data when no prices found', async () => {
      const result = await service.getPricesHistory('user-id', 30);
      expect(result.success).toBe(true);
      expect(result.data.dailyPrices).toEqual([]);
    });
  });

  describe('getConsumptionAnalytics', () => {
    it('should throw error if days is not 30, 60, or 90', async () => {
      await expect(service.getConsumptionAnalytics('user-id', 45)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return empty data when no logs found', async () => {
      const result = await service.getConsumptionAnalytics('user-id', 30);
      expect(result.success).toBe(true);
      expect(result.data.consumptionData).toEqual([]);
      expect(result.data.summary.totalConsumption).toBe(0);
    });
  });

  describe('calculateSavings', () => {
    it('should return default savings when no logs found', async () => {
      const result = await service.calculateSavings('user-id');
      expect(result.success).toBe(true);
      expect(result.data.estimatedSavings).toBe('€0.00');
      expect(result.data.savingsPercent).toBe(0);
    });
  });
});
