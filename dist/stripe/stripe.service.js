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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const stripe_1 = __importDefault(require("stripe"));
let StripeService = class StripeService {
    stripe;
    constructor() {
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2026-05-27.dahlia',
        });
    }
    async createCheckoutSession(planType, userId) {
        const prices = {
            STANDARD: 499,
            BUSINESS: 999,
        };
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `CENTRAL BUY - ${planType} Plan`,
                            description: `Annual subscription for ${planType} members`,
                        },
                        unit_amount: prices[planType],
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/pricing`,
        });
        return session;
    }
    async getSession(sessionId) {
        return await this.stripe.checkout.sessions.retrieve(sessionId);
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], StripeService);
//# sourceMappingURL=stripe.service.js.map