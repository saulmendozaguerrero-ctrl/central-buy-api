import { Repository } from 'typeorm';
import type { Cache } from 'cache-manager';
import { FuelPrice, FuelProduct, FuelRegion } from './entities/fuel-price.entity';
import { CreatePriceDto } from './dto/create-price.dto';
import { PriceHistoryQueryDto } from './dto/price-query.dto';
import { User } from '../users/entities/user.entity';
export declare class PricesService {
    private readonly priceRepo;
    private readonly cache;
    private readonly logger;
    constructor(priceRepo: Repository<FuelPrice>, cache: Cache);
    getLatest(): Promise<FuelPrice[]>;
    getByProduct(product: FuelProduct): Promise<FuelPrice[]>;
    getByRegion(region: FuelRegion): Promise<FuelPrice[]>;
    getHistory(query: PriceHistoryQueryDto): Promise<FuelPrice[]>;
    getBestPrices(): Promise<Record<string, FuelPrice>>;
    uploadPrices(dtos: CreatePriceDto[], createdBy: User): Promise<FuelPrice[]>;
}
