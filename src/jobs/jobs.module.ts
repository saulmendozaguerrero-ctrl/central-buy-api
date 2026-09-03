import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { MonthlyReportJob } from './monthly-report.job';
import { EcoScoreCalcJob } from './eco-score-calc.job';
import { PriceImportJob } from './price-import.job';
import { PlattsScrapeJob } from './platts-scrape.job';
import { TrialExpiringJob } from './trial-expiring.job';
import { MarketDataService } from '../services/market-data.service';
import { Organization } from '../modules/organizations/entities/organization.entity';
import { OrgMember } from '../modules/organizations/entities/org-member.entity';
import { Report } from '../modules/fleet/entities/report.entity';
import { FuelLog } from '../modules/fleet/entities/fuel-log.entity';
import { Vehicle } from '../modules/fleet/entities/vehicle.entity';
import { EcoScore } from '../modules/fleet/entities/eco-score.entity';
import { EcoScoreService } from '../modules/fleet/eco-score.service';
import { PlattsPrice, PlattsSnapshot } from '../modules/prices/entities/platts-price.entity';
import { PlattsService } from '../modules/prices/platts.service';
import { Subscription } from '../modules/subscriptions/entities/subscription.entity';
import { User } from '../modules/users/entities/user.entity';
import { EmailService } from '../email/email.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      Organization,
      OrgMember,
      Report,
      FuelLog,
      Vehicle,
      EcoScore,
      PlattsPrice,
      PlattsSnapshot,
      Subscription,
      User,
    ]),
  ],
  providers: [
    MonthlyReportJob,
    EcoScoreCalcJob,
    PriceImportJob,
    PlattsScrapeJob,
    TrialExpiringJob,
    MarketDataService,
    EcoScoreService,
    PlattsService,
    EmailService,
  ],
})
export class JobsModule {}
