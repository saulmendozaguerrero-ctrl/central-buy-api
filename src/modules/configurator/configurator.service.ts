import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceConfig } from './entities/price-config.entity';
import { CalculatePriceDto } from './dto/calculate-price.dto';

export interface PriceCalculationResult {
  purchasePrice: number;
  operatingCosts: number;
  desiredMargin: number;
  recommendedPrice: number;
  totalCostBase: number;
  marginAmount: number;
  zoneAvgPrice?: number;
  vsZoneAvg?: number;
  simulation: {
    marginAt5pct: number;
    marginAt10pct: number;
    marginAt15pct: number;
  };
}

@Injectable()
export class ConfiguratorService {
  constructor(
    @InjectRepository(PriceConfig)
    private readonly configRepo: Repository<PriceConfig>,
  ) {}

  calculate(dto: CalculatePriceDto): PriceCalculationResult {
    const totalCostBase = dto.purchasePrice + dto.operatingCosts;
    const marginAmount = totalCostBase * (dto.desiredMargin / 100);
    const recommendedPrice = totalCostBase + marginAmount;

    const result: PriceCalculationResult = {
      purchasePrice: dto.purchasePrice,
      operatingCosts: dto.operatingCosts,
      desiredMargin: dto.desiredMargin,
      totalCostBase: Math.round(totalCostBase * 100) / 100,
      marginAmount: Math.round(marginAmount * 100) / 100,
      recommendedPrice: Math.round(recommendedPrice * 100) / 100,
      simulation: {
        marginAt5pct: Math.round(totalCostBase * 1.05 * 100) / 100,
        marginAt10pct: Math.round(totalCostBase * 1.10 * 100) / 100,
        marginAt15pct: Math.round(totalCostBase * 1.15 * 100) / 100,
      },
    };

    if (dto.zoneAvgPrice) {
      result.zoneAvgPrice = dto.zoneAvgPrice;
      result.vsZoneAvg = Math.round(
        ((recommendedPrice - dto.zoneAvgPrice) / dto.zoneAvgPrice) * 100 * 100,
      ) / 100;
    }

    return result;
  }

  async calculateAndSave(dto: CalculatePriceDto, userId: string): Promise<{
    result: PriceCalculationResult;
    saved?: PriceConfig;
  }> {
    const result = this.calculate(dto);

    if (!dto.saveName) return { result };

    const config = this.configRepo.create({
      userId,
      name: dto.saveName,
      product: dto.product,
      purchasePrice: dto.purchasePrice,
      operatingCosts: dto.operatingCosts,
      desiredMargin: dto.desiredMargin,
      recommendedPrice: result.recommendedPrice,
      zoneAvgPrice: dto.zoneAvgPrice,
    });

    const saved = await this.configRepo.save(config);
    return { result, saved };
  }

  async getSavedConfigs(userId: string): Promise<PriceConfig[]> {
    return this.configRepo.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async deleteConfig(id: string, userId: string): Promise<void> {
    const config = await this.configRepo.findOne({ where: { id, userId } });
    if (!config) throw new NotFoundException('Configuration not found');
    await this.configRepo.remove(config);
  }
}
