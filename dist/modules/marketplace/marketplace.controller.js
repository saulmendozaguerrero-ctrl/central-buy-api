"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const marketplace_service_1 = require("./marketplace.service");
const create_listing_dto_1 = require("./dto/create-listing.dto");
const auth_guard_1 = require("../../common/guards/auth.guard");
const plan_guard_1 = require("../../common/guards/plan.guard");
const plan_required_decorator_1 = require("../../common/decorators/plan-required.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const listing_entity_1 = require("./entities/listing.entity");
let MarketplaceController = class MarketplaceController {
    marketplaceService;
    constructor(marketplaceService) {
        this.marketplaceService = marketplaceService;
    }
    async getAll(type, product, location) {
        return this.marketplaceService.getAll({ type, product, location });
    }
    async getMy(user) {
        return this.marketplaceService.getMyListings(user.id);
    }
    async create(dto, user) {
        return this.marketplaceService.create(dto, user.id);
    }
    async update(id, dto, user) {
        return this.marketplaceService.update(id, user.id, dto);
    }
    async close(id, user) {
        return this.marketplaceService.close(id, user.id);
    }
};
exports.MarketplaceController = MarketplaceController;
__decorate([
    (0, common_1.Get)('listings'),
    (0, swagger_1.ApiOperation)({ summary: 'Browse active marketplace listings' }),
    (0, swagger_1.ApiQuery)({ name: 'type', enum: listing_entity_1.ListingType, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'product', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'location', required: false }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('product')),
    __param(2, (0, common_1.Query)('location')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('listings/my'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my own listings' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getMy", null);
__decorate([
    (0, common_1.Post)('listings'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new offer or demand listing' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_listing_dto_1.CreateListingDto, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('listings/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a listing' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('listings/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Close a listing' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "close", null);
exports.MarketplaceController = MarketplaceController = __decorate([
    (0, swagger_1.ApiTags)('Marketplace'),
    (0, common_1.Controller)('marketplace'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, plan_guard_1.PlanGuard),
    (0, plan_required_decorator_1.PlanRequired)('particular'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [marketplace_service_1.MarketplaceService])
], MarketplaceController);
//# sourceMappingURL=marketplace.controller.js.map