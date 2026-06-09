import { User } from '../../users/entities/user.entity';
export declare class PriceConfig {
    id: string;
    user: User;
    userId: string;
    name: string;
    product: string;
    purchasePrice: number;
    operatingCosts: number;
    desiredMargin: number;
    recommendedPrice: number;
    zoneAvgPrice: number;
    createdAt: Date;
    updatedAt: Date;
}
