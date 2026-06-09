import { User } from '../../users/entities/user.entity';
export declare enum ListingType {
    OFFER = "offer",
    DEMAND = "demand"
}
export declare enum ListingStatus {
    ACTIVE = "active",
    CLOSED = "closed",
    EXPIRED = "expired"
}
export declare class MarketplaceListing {
    id: string;
    user: User;
    userId: string;
    type: ListingType;
    product: string;
    volumeMt: number;
    pricePerMt: number;
    currency: string;
    location: string;
    deliveryTerms: string;
    description: string;
    validUntil: string;
    status: ListingStatus;
    createdAt: Date;
}
