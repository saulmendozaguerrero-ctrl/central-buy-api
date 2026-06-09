import { ListingType } from '../entities/listing.entity';
export declare class CreateListingDto {
    type: ListingType;
    product: string;
    volumeMt?: number;
    pricePerMt?: number;
    currency?: string;
    location?: string;
    deliveryTerms?: string;
    description?: string;
    validUntil?: string;
}
