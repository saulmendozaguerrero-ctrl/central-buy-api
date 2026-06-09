import { ConfiguratorService } from './configurator.service';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { User } from '../users/entities/user.entity';
export declare class ConfiguratorController {
    private readonly configuratorService;
    constructor(configuratorService: ConfiguratorService);
    calculate(dto: CalculatePriceDto, user: User): Promise<{
        result: import("./configurator.service").PriceCalculationResult;
        saved?: import("./entities/price-config.entity").PriceConfig;
    }>;
    getSaved(user: User): Promise<import("./entities/price-config.entity").PriceConfig[]>;
    delete(id: string, user: User): Promise<{
        deleted: boolean;
    }>;
}
