import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

// Config files
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import stripeConfig from './config/stripe.config';
import clerkConfig from './config/clerk.config';

// Entities
import { User } from './modules/users/entities/user.entity';
import { Subscription } from './modules/subscriptions/entities/subscription.entity';
import { Organization } from './modules/organizations/entities/organization.entity';
import { OrgMember } from './modules/organizations/entities/org-member.entity';
import { FuelPrice } from './modules/prices/entities/fuel-price.entity';
import { Vehicle } from './modules/fleet/entities/vehicle.entity';
import { FuelLog } from './modules/fleet/entities/fuel-log.entity';
import { EcoScore } from './modules/fleet/entities/eco-score.entity';
import { Report } from './modules/fleet/entities/report.entity';
import { Consultation } from './modules/consultations/entities/consultation.entity';
import { Consultant } from './modules/consultations/entities/consultant.entity';
import { PriceConfig } from './modules/configurator/entities/price-config.entity';
import { AcademyContent } from './modules/academy/entities/content.entity';
import { MarketplaceListing } from './modules/marketplace/entities/listing.entity';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PricesModule } from './modules/prices/prices.module';
import { ConfiguratorModule } from './modules/configurator/configurator.module';
import { ConsultationsModule } from './modules/consultations/consultations.module';
import { FleetModule } from './modules/fleet/fleet.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { AdminModule } from './modules/admin/admin.module';
import { AcademyModule } from './modules/academy/academy.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { JobsModule } from './jobs/jobs.module';
import { StripeModule } from './stripe/stripe.module';

// App
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // ─── Config ─────────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, stripeConfig, clerkConfig],
      envFilePath: '.env',
    }),

    // ─── Rate Limiting ───────────────────────────────────────────────────────
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // ─── Scheduler ──────────────────────────────────────────────────────────
    ScheduleModule.forRoot(),

    // ─── Database ───────────────────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('database.url'),
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.name'),
        entities: [
          User,
          Subscription,
          Organization,
          OrgMember,
          FuelPrice,
          Vehicle,
          FuelLog,
          EcoScore,
          Report,
          Consultation,
          Consultant,
          PriceConfig,
          AcademyContent,
          MarketplaceListing,
        ],
        synchronize: config.get<string>('app.nodeEnv') === 'development',
        logging: config.get<string>('app.nodeEnv') === 'development',
        ssl:
          config.get<string>('app.nodeEnv') === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),

    // ─── Cache (in-memory for dev, Redis for prod) ───────────────────────────
    CacheModule.register({
      isGlobal: true,
      ttl: 300,
      max: 500,
    }),

    // ─── Feature Modules ─────────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    SubscriptionsModule,
    PricesModule,
    ConfiguratorModule,
    ConsultationsModule,
    FleetModule,
    OrganizationsModule,
    AdminModule,
    AcademyModule,
    MarketplaceModule,
    JobsModule,
  StripeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
