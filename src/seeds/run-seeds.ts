import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { EcoPill } from '../modules/academy/entities/eco-pill.entity';
import { ecoPillsSeeds } from './eco-pills.seed';

// Import all entities
import { User } from '../modules/users/entities/user.entity';
import { UserProfile } from '../modules/users/entities/user-profile.entity';
import { Subscription } from '../modules/subscriptions/entities/subscription.entity';
import { Organization } from '../modules/organizations/entities/organization.entity';
import { OrgMember } from '../modules/organizations/entities/org-member.entity';
import { FuelPrice } from '../modules/prices/entities/fuel-price.entity';
import { Vehicle } from '../modules/fleet/entities/vehicle.entity';
import { FuelLog } from '../modules/fleet/entities/fuel-log.entity';
import { EcoScore } from '../modules/fleet/entities/eco-score.entity';
import { Report } from '../modules/fleet/entities/report.entity';
import { Consultation } from '../modules/consultations/entities/consultation.entity';
import { Consultant } from '../modules/consultations/entities/consultant.entity';
import { PriceConfig } from '../modules/configurator/entities/price-config.entity';
import { AcademyContent } from '../modules/academy/entities/content.entity';
import { EcoQuiz } from '../modules/academy/entities/eco-quiz.entity';
import { EcoQuizAttempt } from '../modules/academy/entities/eco-quiz-attempt.entity';
import { EcoProgress } from '../modules/academy/entities/eco-progress.entity';
import { EcoCertificate } from '../modules/academy/entities/eco-certificate.entity';
import { MarketplaceListing } from '../modules/marketplace/entities/listing.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASS || 'postgres',
  database: process.env.DATABASE_NAME || 'centralbuy',
  entities: [
    User,
    UserProfile,
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
    EcoPill,
    EcoQuiz,
    EcoQuizAttempt,
    EcoProgress,
    EcoCertificate,
    MarketplaceListing,
  ],
  synchronize: false,
  logging: true,
});

async function runSeeds() {
  try {
    await dataSource.initialize();
    console.log('✅ Database connection initialized');

    const ecoPillRepository = dataSource.getRepository(EcoPill);

    console.log('🌱 Seeding EcoPills...');
    for (const pill of ecoPillsSeeds) {
      const existing = await ecoPillRepository.findOne({ where: { slug: pill.slug } });
      if (!existing) {
        const newPill = ecoPillRepository.create(pill);
        await ecoPillRepository.save(newPill);
        console.log(`✅ Created EcoPill: ${pill.title}`);
      } else {
        console.log(`⏭️  EcoPill already exists: ${pill.title}`);
      }
    }

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeeds();
