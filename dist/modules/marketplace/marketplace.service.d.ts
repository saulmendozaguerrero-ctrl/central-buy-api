import { Repository } from 'typeorm';
import { MarketplaceListing, ListingType } from './entities/listing.entity';
import { CreateListingDto } from './dto/create-listing.dto';
export declare class MarketplaceService {
    private readonly listingRepo;
    constructor(listingRepo: Repository<MarketplaceListing>);
    getAll(filters?: {
        type?: ListingType;
        product?: string;
        location?: string;
    }): Promise<MarketplaceListing[]>;
    create(dto: CreateListingDto, userId: string): Promise<MarketplaceListing>;
    update(id: string, userId: string, dto: Partial<CreateListingDto>): Promise<MarketplaceListing>;
    close(id: string, userId: string): Promise<MarketplaceListing>;
    getMyListings(userId: string): Promise<MarketplaceListing[]>;
}
