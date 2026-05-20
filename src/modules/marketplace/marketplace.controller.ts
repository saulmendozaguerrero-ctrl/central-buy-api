import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PlanGuard } from '../../common/guards/plan.guard';
import { PlanRequired } from '../../common/decorators/plan-required.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ListingType } from './entities/listing.entity';

@ApiTags('Marketplace')
@Controller('marketplace')
@UseGuards(AuthGuard, PlanGuard)
@PlanRequired('particular')
@ApiBearerAuth()
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get('listings')
  @ApiOperation({ summary: 'Browse active marketplace listings' })
  @ApiQuery({ name: 'type', enum: ListingType, required: false })
  @ApiQuery({ name: 'product', required: false })
  @ApiQuery({ name: 'location', required: false })
  async getAll(
    @Query('type') type?: ListingType,
    @Query('product') product?: string,
    @Query('location') location?: string,
  ) {
    return this.marketplaceService.getAll({ type, product, location });
  }

  @Get('listings/my')
  @ApiOperation({ summary: 'Get my own listings' })
  async getMy(@CurrentUser() user: User) {
    return this.marketplaceService.getMyListings(user.id);
  }

  @Post('listings')
  @ApiOperation({ summary: 'Create a new offer or demand listing' })
  async create(@Body() dto: CreateListingDto, @CurrentUser() user: User) {
    return this.marketplaceService.create(dto, user.id);
  }

  @Patch('listings/:id')
  @ApiOperation({ summary: 'Update a listing' })
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateListingDto>,
    @CurrentUser() user: User,
  ) {
    return this.marketplaceService.update(id, user.id, dto);
  }

  @Delete('listings/:id')
  @ApiOperation({ summary: 'Close a listing' })
  async close(@Param('id') id: string, @CurrentUser() user: User) {
    return this.marketplaceService.close(id, user.id);
  }
}
