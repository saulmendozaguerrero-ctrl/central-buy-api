import { MarketplaceService } from './marketplace.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { User } from '../users/entities/user.entity';
import { ListingType } from './entities/listing.entity';
export declare class MarketplaceController {
    private readonly marketplaceService;
    constructor(marketplaceService: MarketplaceService);
    getAll(type?: ListingType, product?: string, location?: string): Promise<import("./entities/listing.entity").MarketplaceListing[]>;
    getMy(user: User): Promise<import("./entities/listing.entity").MarketplaceListing[]>;
    create(dto: CreateListingDto, user: User): Promise<import("./entities/listing.entity").MarketplaceListing>;
    update(id: string, dto: Partial<CreateListingDto>, user: User): Promise<import("./entities/listing.entity").MarketplaceListing>;
    close(id: string, user: User): Promise<import("./entities/listing.entity").MarketplaceListing>;
}
