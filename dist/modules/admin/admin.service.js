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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const dayjs_1 = __importDefault(require("dayjs"));
const user_entity_1 = require("../users/entities/user.entity");
const subscription_entity_1 = require("../subscriptions/entities/subscription.entity");
let AdminService = class AdminService {
    userRepo;
    subscriptionRepo;
    constructor(userRepo, subscriptionRepo) {
        this.userRepo = userRepo;
        this.subscriptionRepo = subscriptionRepo;
    }
    async getMetrics() {
        const now = (0, dayjs_1.default)();
        const monthStart = now.startOf('month').toDate();
        const lastMonthStart = now.subtract(1, 'month').startOf('month').toDate();
        const lastMonthEnd = now.subtract(1, 'month').endOf('month').toDate();
        const [totalUsers, activeSubs, trialingSubs, canceledThisMonth, newUsersThisMonth, newUsersLastMonth,] = await Promise.all([
            this.userRepo.count(),
            this.subscriptionRepo.count({ where: { status: subscription_entity_1.SubscriptionStatus.ACTIVE } }),
            this.subscriptionRepo.count({ where: { status: subscription_entity_1.SubscriptionStatus.TRIALING } }),
            this.subscriptionRepo
                .createQueryBuilder('s')
                .where('s.status = :status', { status: subscription_entity_1.SubscriptionStatus.CANCELED })
                .andWhere('s.canceledAt >= :start', { start: monthStart })
                .getCount(),
            this.userRepo
                .createQueryBuilder('u')
                .where('u.createdAt >= :start', { start: monthStart })
                .getCount(),
            this.userRepo
                .createQueryBuilder('u')
                .where('u.createdAt >= :start AND u.createdAt <= :end', {
                start: lastMonthStart,
                end: lastMonthEnd,
            })
                .getCount(),
        ]);
        const allActiveSubs = await this.subscriptionRepo.find({
            where: { status: subscription_entity_1.SubscriptionStatus.ACTIVE },
        });
        const mrrParticular = allActiveSubs.filter((s) => s.plan === subscription_entity_1.SubscriptionPlan.PARTICULAR).length * 4.99;
        const mrrEmpresa = allActiveSubs.filter((s) => s.plan === subscription_entity_1.SubscriptionPlan.EMPRESA).length * 9.99;
        const mrr = Math.round((mrrParticular + mrrEmpresa) * 100) / 100;
        const churnRate = activeSubs > 0
            ? Math.round((canceledThisMonth / activeSubs) * 100 * 100) / 100
            : 0;
        const ltv = churnRate > 0 ? Math.round((mrr / activeSubs / (churnRate / 100)) * 100) / 100 : 0;
        return {
            totalUsers,
            activeSubscriptions: activeSubs,
            trialingSubscriptions: trialingSubs,
            canceledThisMonth,
            mrr,
            mrrParticular: Math.round(mrrParticular * 100) / 100,
            mrrEmpresa: Math.round(mrrEmpresa * 100) / 100,
            churnRate,
            newUsersThisMonth,
            newUsersLastMonth,
            ltv,
        };
    }
    async getUsers(page = 1, limit = 20) {
        const [users, total] = await this.userRepo.findAndCount({
            relations: {},
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { users, total };
    }
    async getSubscriptions(page = 1, limit = 20) {
        const [subscriptions, total] = await this.subscriptionRepo.findAndCount({
            relations: { user: true },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { subscriptions, total };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map