import { FuelProduct, FuelRegion } from '../entities/fuel-price.entity';
export declare class PriceHistoryQueryDto {
    product?: FuelProduct;
    region?: FuelRegion;
    from?: string;
    to?: string;
}
