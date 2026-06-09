import { PricesService } from './prices.service';
import { CreatePriceDto } from './dto/create-price.dto';
import { PriceHistoryQueryDto } from './dto/price-query.dto';
import { FuelProduct, FuelRegion } from './entities/fuel-price.entity';
import { User } from '../users/entities/user.entity';
export declare class PricesController {
    private readonly pricesService;
    constructor(pricesService: PricesService);
    getLatest(): Promise<import("./entities/fuel-price.entity").FuelPrice[]>;
    getBest(): Promise<Record<string, import("./entities/fuel-price.entity").FuelPrice>>;
    getHistory(query: PriceHistoryQueryDto): Promise<import("./entities/fuel-price.entity").FuelPrice[]>;
    getByProduct(product: FuelProduct): Promise<import("./entities/fuel-price.entity").FuelPrice[]>;
    getByRegion(region: FuelRegion): Promise<import("./entities/fuel-price.entity").FuelPrice[]>;
    uploadPrices(prices: CreatePriceDto[], user: User): Promise<import("./entities/fuel-price.entity").FuelPrice[]>;
}
