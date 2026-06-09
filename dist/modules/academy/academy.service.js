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
exports.AcademyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const content_entity_1 = require("./entities/content.entity");
const subscription_entity_1 = require("../subscriptions/entities/subscription.entity");
let AcademyService = class AcademyService {
    contentRepo;
    constructor(contentRepo) {
        this.contentRepo = contentRepo;
    }
    async getAll(userPlan) {
        const qb = this.contentRepo
            .createQueryBuilder('c')
            .where('c.published = true')
            .orderBy('c.createdAt', 'DESC');
        if (!userPlan) {
            qb.andWhere('c.accessLevel = :free', { free: content_entity_1.ContentAccessLevel.FREE });
        }
        else if (userPlan === subscription_entity_1.SubscriptionPlan.PARTICULAR) {
            qb.andWhere('c.accessLevel IN (:...levels)', {
                levels: [content_entity_1.ContentAccessLevel.FREE, content_entity_1.ContentAccessLevel.PARTICULAR],
            });
        }
        return qb.getMany();
    }
    async getBySlug(slug) {
        const content = await this.contentRepo.findOne({ where: { slug, published: true } });
        if (!content)
            throw new common_1.NotFoundException('Content not found');
        return content;
    }
    async getCategories() {
        const results = await this.contentRepo
            .createQueryBuilder('c')
            .select('DISTINCT c.category', 'category')
            .where('c.published = true AND c.category IS NOT NULL')
            .getRawMany();
        return results.map((r) => r.category);
    }
    async create(dto) {
        const content = this.contentRepo.create(dto);
        return this.contentRepo.save(content);
    }
    async update(id, dto) {
        const content = await this.contentRepo.findOne({ where: { id } });
        if (!content)
            throw new common_1.NotFoundException('Content not found');
        Object.assign(content, dto);
        return this.contentRepo.save(content);
    }
    async delete(id) {
        await this.contentRepo.delete(id);
    }
};
exports.AcademyService = AcademyService;
exports.AcademyService = AcademyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(content_entity_1.AcademyContent)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AcademyService);
//# sourceMappingURL=academy.service.js.map