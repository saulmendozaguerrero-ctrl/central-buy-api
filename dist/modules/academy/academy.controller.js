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
exports.AcademyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const academy_service_1 = require("./academy.service");
const create_content_dto_1 = require("./dto/create-content.dto");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let AcademyController = class AcademyController {
    academyService;
    constructor(academyService) {
        this.academyService = academyService;
    }
    async getAll(user) {
        return this.academyService.getAll(user.planType);
    }
    async getBySlug(slug) {
        return this.academyService.getBySlug(slug);
    }
    async getCategories() {
        return this.academyService.getCategories();
    }
    async create(dto) {
        return this.academyService.create(dto);
    }
    async update(id, dto) {
        return this.academyService.update(id, dto);
    }
    async delete(id) {
        await this.academyService.delete(id);
        return { deleted: true };
    }
};
exports.AcademyController = AcademyController;
__decorate([
    (0, common_1.Get)('content'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'List published content (filtered by plan)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], AcademyController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('content/:slug'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get content by slug' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademyController.prototype, "getBySlug", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'List content categories' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AcademyController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Post)('content'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Create academy content' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_content_dto_1.CreateContentDto]),
    __metadata("design:returntype", Promise)
], AcademyController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('content/:id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Update academy content' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AcademyController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('content/:id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Delete content' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademyController.prototype, "delete", null);
exports.AcademyController = AcademyController = __decorate([
    (0, swagger_1.ApiTags)('Academy'),
    (0, common_1.Controller)('academy'),
    __metadata("design:paramtypes", [academy_service_1.AcademyService])
], AcademyController);
//# sourceMappingURL=academy.controller.js.map