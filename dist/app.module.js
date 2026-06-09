"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const throttler_1 = require("@nestjs/throttler");
const schedule_1 = require("@nestjs/schedule");
const app_config_1 = __importDefault(require("./config/app.config"));
const database_config_1 = __importDefault(require("./config/database.config"));
const redis_config_1 = __importDefault(require("./config/redis.config"));
const stripe_config_1 = __importDefault(require("./config/stripe.config"));
const clerk_config_1 = __importDefault(require("./config/clerk.config"));
const user_entity_1 = require("./modules/users/entities/user.entity");
const subscription_entity_1 = require("./modules/subscriptions/entities/subscription.entity");
const organization_entity_1 = require("./modules/organizations/entities/organization.entity");
const org_member_entity_1 = require("./modules/organizations/entities/org-member.entity");
const fuel_price_entity_1 = require("./modules/prices/entities/fuel-price.entity");
const vehicle_entity_1 = require("./modules/fleet/entities/vehicle.entity");
const fuel_log_entity_1 = require("./modules/fleet/entities/fuel-log.entity");
const eco_score_entity_1 = require("./modules/fleet/entities/eco-score.entity");
const report_entity_1 = require("./modules/fleet/entities/report.entity");
const consultation_entity_1 = require("./modules/consultations/entities/consultation.entity");
const consultant_entity_1 = require("./modules/consultations/entities/consultant.entity");
const price_config_entity_1 = require("./modules/configurator/entities/price-config.entity");
const content_entity_1 = require("./modules/academy/entities/content.entity");
const listing_entity_1 = require("./modules/marketplace/entities/listing.entity");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const subscriptions_module_1 = require("./modules/subscriptions/subscriptions.module");
const prices_module_1 = require("./modules/prices/prices.module");
const configurator_module_1 = require("./modules/configurator/configurator.module");
const consultations_module_1 = require("./modules/consultations/consultations.module");
const fleet_module_1 = require("./modules/fleet/fleet.module");
const organizations_module_1 = require("./modules/organizations/organizations.module");
const admin_module_1 = require("./modules/admin/admin.module");
const academy_module_1 = require("./modules/academy/academy.module");
const marketplace_module_1 = require("./modules/marketplace/marketplace.module");
const jobs_module_1 = require("./jobs/jobs.module");
const stripe_module_1 = require("./stripe/stripe.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [app_config_1.default, database_config_1.default, redis_config_1.default, stripe_config_1.default, clerk_config_1.default],
                envFilePath: '.env',
            }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    url: config.get('database.url'),
                    host: config.get('database.host'),
                    port: config.get('database.port'),
                    username: config.get('database.username'),
                    password: config.get('database.password'),
                    database: config.get('database.name'),
                    entities: [
                        user_entity_1.User,
                        subscription_entity_1.Subscription,
                        organization_entity_1.Organization,
                        org_member_entity_1.OrgMember,
                        fuel_price_entity_1.FuelPrice,
                        vehicle_entity_1.Vehicle,
                        fuel_log_entity_1.FuelLog,
                        eco_score_entity_1.EcoScore,
                        report_entity_1.Report,
                        consultation_entity_1.Consultation,
                        consultant_entity_1.Consultant,
                        price_config_entity_1.PriceConfig,
                        content_entity_1.AcademyContent,
                        listing_entity_1.MarketplaceListing,
                    ],
                    synchronize: true,
                    logging: config.get('app.nodeEnv') === 'development',
                    ssl: config.get('app.nodeEnv') === 'production'
                        ? { rejectUnauthorized: false }
                        : false,
                }),
            }),
            cache_manager_1.CacheModule.register({
                isGlobal: true,
                ttl: 300,
                max: 500,
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            subscriptions_module_1.SubscriptionsModule,
            prices_module_1.PricesModule,
            configurator_module_1.ConfiguratorModule,
            consultations_module_1.ConsultationsModule,
            fleet_module_1.FleetModule,
            organizations_module_1.OrganizationsModule,
            admin_module_1.AdminModule,
            academy_module_1.AcademyModule,
            marketplace_module_1.MarketplaceModule,
            jobs_module_1.JobsModule,
            stripe_module_1.StripeModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map