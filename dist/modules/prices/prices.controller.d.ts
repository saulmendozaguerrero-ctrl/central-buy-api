import { PricesService } from './prices.service';
import { PriceHistoryQueryDto } from './dto/price-query.dto';
import { FuelProduct, FuelRegion } from './entities/fuel-price.entity';
export declare class PricesController {
    private readonly pricesService;
    constructor(pricesService: PricesService);
    getLatest(): Promise<import("./entities/fuel-price.entity").FuelPrice[]>;
    getBest(): Promise<Record<string, import("./entities/fuel-price.entity").FuelPrice>>;
    getHistory(query: PriceHistoryQueryDto): Promise<import("./entities/fuel-price.entity").FuelPrice[]>;
    getByProduct(product: FuelProduct): Promise<import("./entities/fuel-price.entity").FuelPrice[]>;
    getByRegion(region: FuelRegion): Promise<import("./entities/fuel-price.entity").FuelPrice[]>;
    seed(): Promise<import("./entities/fuel-price.entity").FuelPrice[]>;
}
