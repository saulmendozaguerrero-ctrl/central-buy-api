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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const dayjs_1 = __importDefault(require("dayjs"));
const consultation_entity_1 = require("./entities/consultation.entity");
const consultant_entity_1 = require("./entities/consultant.entity");
const subscription_entity_1 = require("../subscriptions/entities/subscription.entity");
let ConsultationsService = class ConsultationsService {
    consultationRepo;
    consultantRepo;
    subscriptionRepo;
    constructor(consultationRepo, consultantRepo, subscriptionRepo) {
        this.consultationRepo = consultationRepo;
        this.consultantRepo = consultantRepo;
        this.subscriptionRepo = subscriptionRepo;
    }
    async getAvailableSlots(consultantId, date) {
        const consultant = await this.consultantRepo.findOne({ where: { id: consultantId } });
        if (!consultant)
            throw new common_1.NotFoundException('Consultant not found');
        const dayStart = (0, dayjs_1.default)(date).startOf('day');
        const dayEnd = (0, dayjs_1.default)(date).endOf('day');
        const booked = await this.consultationRepo.find({
            where: {
                consultantId: consultant.userId,
                scheduledAt: (0, typeorm_2.Between)(dayStart.toDate(), dayEnd.toDate()),
                status: consultation_entity_1.ConsultationStatus.SCHEDULED,
            },
        });
        const bookedTimes = new Set(booked.map((c) => (0, dayjs_1.default)(c.scheduledAt).format('HH:mm')));
        const slots = [];
        for (let hour = 9; hour < 18; hour++) {
            for (const min of [0, 30]) {
                const slot = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
                if (!bookedTimes.has(slot))
                    slots.push(slot);
            }
        }
        return slots;
    }
    async book(userId, dto) {
        const subscription = await this.subscriptionRepo.findOne({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
        if (!subscription)
            throw new common_1.BadRequestException('Active subscription required');
        const monthStart = (0, dayjs_1.default)().startOf('month').toDate();
        const monthEnd = (0, dayjs_1.default)().endOf('month').toDate();
        const thisMonthCount = await this.consultationRepo.count({
            where: {
                userId,
                scheduledAt: (0, typeorm_2.Between)(monthStart, monthEnd),
                status: consultation_entity_1.ConsultationStatus.SCHEDULED,
            },
        });
        const maxSessions = subscription.plan === subscription_entity_1.SubscriptionPlan.EMPRESA ? 2 : 1;
        if (thisMonthCount >= maxSessions) {
            throw new common_1.BadRequestException(`You have reached your monthly consultation limit (${maxSessions} sessions)`);
        }
        const durationMin = subscription.plan === subscription_entity_1.SubscriptionPlan.EMPRESA ? 30 : 15;
        const consultation = this.consultationRepo.create({
            userId,
            consultantId: dto.consultantId,
            scheduledAt: new Date(dto.scheduledAt),
            durationMin,
            notes: dto.notes,
            status: consultation_entity_1.ConsultationStatus.SCHEDULED,
        });
        return this.consultationRepo.save(consultation);
    }
    async getMyConsultations(userId) {
        return this.consultationRepo.find({
            where: { userId },
            relations: { consultant: true },
            order: { scheduledAt: 'DESC' },
        });
    }
    async cancel(id, userId) {
        const consultation = await this.consultationRepo.findOne({
            where: { id, userId },
        });
        if (!consultation)
            throw new common_1.NotFoundException('Consultation not found');
        if (consultation.status !== consultation_entity_1.ConsultationStatus.SCHEDULED) {
            throw new common_1.BadRequestException('Only scheduled consultations can be canceled');
        }
        const hoursUntil = (0, dayjs_1.default)(consultation.scheduledAt).diff((0, dayjs_1.default)(), 'hours');
        if (hoursUntil < 2) {
            throw new common_1.BadRequestException('Cannot cancel with less than 2 hours notice');
        }
        consultation.status = consultation_entity_1.ConsultationStatus.CANCELED;
        return this.consultationRepo.save(consultation);
    }
    async getConsultants() {
        return this.consultantRepo.find({ where: { active: true } });
    }
};
exports.ConsultationsService = ConsultationsService;
exports.ConsultationsService = ConsultationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(consultation_entity_1.Consultation)),
    __param(1, (0, typeorm_1.InjectRepository)(consultant_entity_1.Consultant)),
    __param(2, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ConsultationsService);
//# sourceMappingURL=consultations.service.js.map