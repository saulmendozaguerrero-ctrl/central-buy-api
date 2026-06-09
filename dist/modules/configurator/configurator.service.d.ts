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
export declare class ConfiguratorService {
    private readonly configRepo;
    constructor(configRepo: Repository<PriceConfig>);
    calculate(dto: CalculatePriceDto): PriceCalculationResult;
    calculateAndSave(dto: CalculatePriceDto, userId: string): Promise<{
        result: PriceCalculationResult;
        saved?: PriceConfig;
    }>;
    getSavedConfigs(userId: string): Promise<PriceConfig[]>;
    deleteConfig(id: string, userId: string): Promise<void>;
}
