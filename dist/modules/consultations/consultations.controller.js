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
exports.ConsultationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const consultations_service_1 = require("./consultations.service");
const book_consultation_dto_1 = require("./dto/book-consultation.dto");
const auth_guard_1 = require("../../common/guards/auth.guard");
const plan_guard_1 = require("../../common/guards/plan.guard");
const plan_required_decorator_1 = require("../../common/decorators/plan-required.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let ConsultationsController = class ConsultationsController {
    consultationsService;
    constructor(consultationsService) {
        this.consultationsService = consultationsService;
    }
    async getConsultants() {
        return this.consultationsService.getConsultants();
    }
    async getSlots(consultantId, date) {
        return this.consultationsService.getAvailableSlots(consultantId, date);
    }
    async book(dto, user) {
        return this.consultationsService.book(user.id, dto);
    }
    async getMy(user) {
        return this.consultationsService.getMyConsultations(user.id);
    }
    async cancel(id, user) {
        return this.consultationsService.cancel(id, user.id);
    }
};
exports.ConsultationsController = ConsultationsController;
__decorate([
    (0, common_1.Get)('consultants'),
    (0, swagger_1.ApiOperation)({ summary: 'List active consultants' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConsultationsController.prototype, "getConsultants", null);
__decorate([
    (0, common_1.Get)('slots'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available slots for a consultant on a date' }),
    (0, swagger_1.ApiQuery)({ name: 'consultantId', type: String }),
    (0, swagger_1.ApiQuery)({ name: 'date', type: String, example: '2026-05-25' }),
    __param(0, (0, common_1.Query)('consultantId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ConsultationsController.prototype, "getSlots", null);
__decorate([
    (0, common_1.Post)('book'),
    (0, swagger_1.ApiOperation)({ summary: 'Book a consultation session' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [book_consultation_dto_1.BookConsultationDto, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ConsultationsController.prototype, "book", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my consultation history' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ConsultationsController.prototype, "getMy", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a scheduled consultation' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ConsultationsController.prototype, "cancel", null);
exports.ConsultationsController = ConsultationsController = __decorate([
    (0, swagger_1.ApiTags)('Consultations'),
    (0, common_1.Controller)('consultations'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, plan_guard_1.PlanGuard),
    (0, plan_required_decorator_1.PlanRequired)('particular'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [consultations_service_1.ConsultationsService])
], ConsultationsController);
//# sourceMappingURL=consultations.controller.js.map