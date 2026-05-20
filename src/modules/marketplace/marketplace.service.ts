import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketplaceListing, ListingStatus, ListingType } from './entities/listing.entity';
import { CreateListingDto } from './dto/create-listing.dto';

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectRepository(MarketplaceListing)
    private readonly listingRepo: Repository<MarketplaceListing>,
  ) {}

  async getAll(filters?: {
    type?: ListingType;
    product?: string;
    location?: string;
  }): Promise<MarketplaceListing[]> {
    const qb = this.listingRepo
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.user', 'user')
      .where('l.status = :status', { status: ListingStatus.ACTIVE })
      .orderBy('l.createdAt', 'DESC')
      .take(100);

    if (filters?.type) qb.andWhere('l.type = :type', { type: filters.type });
    if (filters?.product)
      qb.andWhere('LOWER(l.product) LIKE :product', {
        product: `%${filters.product.toLowerCase()}%`,
      });
    if (filters?.location)
      qb.andWhere('LOWER(l.location) LIKE :location', {
        location: `%${filters.location.toLowerCase()}%`,
      });

    return qb.getMany();
  }

  async create(dto: CreateListingDto, userId: string): Promise<MarketplaceListing> {
    const listing = this.listingRepo.create({ ...dto, userId, status: ListingStatus.ACTIVE });
    return this.listingRepo.save(listing);
  }

  async update(
    id: string,
    userId: string,
    dto: Partial<CreateListingDto>,
  ): Promise<MarketplaceListing> {
    const listing = await this.listingRepo.findOne({ where: { id } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.userId !== userId) throw new ForbiddenException('Not your listing');
    Object.assign(listing, dto);
    return this.listingRepo.save(listing);
  }

  async close(id: string, userId: string): Promise<MarketplaceListing> {
    const listing = await this.listingRepo.findOne({ where: { id } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.userId !== userId) throw new ForbiddenException('Not your listing');
    listing.status = ListingStatus.CLOSED;
    return this.listingRepo.save(listing);
  }

  async getMyListings(userId: string): Promise<MarketplaceListing[]> {
    return this.listingRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
