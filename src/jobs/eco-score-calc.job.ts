import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';
import { OrgMember } from '../modules/organizations/entities/org-member.entity';
import { EcoScoreService } from '../modules/fleet/eco-score.service';

@Injectable()
export class EcoScoreCalcJob {
  private readonly logger = new Logger(EcoScoreCalcJob.name);

  constructor(
    @InjectRepository(OrgMember)
    private readonly memberRepo: Repository<OrgMember>,
    private readonly ecoScoreService: EcoScoreService,
  ) {}

  // Runs every Sunday at midnight to calculate weekly eco scores
  @Cron('0 0 * * 0')
  async calculateWeeklyEcoScores(): Promise<void> {
    const periodEnd = dayjs().startOf('day').toDate();
    const periodStart = dayjs().subtract(7, 'days').startOf('day').toDate();

    this.logger.log(`Calculating eco scores for week ending ${dayjs(periodEnd).format('YYYY-MM-DD')}`);

    const drivers = await this.memberRepo.find({
      where: { role: 'driver' as any },
    });

    let calculated = 0;
    for (const driver of drivers) {
      try {
        await this.ecoScoreService.calculateAndSaveForDriver(
          driver.userId,
          driver.orgId,
          periodStart,
          periodEnd,
        );
        calculated++;
      } catch (err) {
        this.logger.error(`Failed to calc eco score for driver ${driver.userId}`, err);
      }
    }

    this.logger.log(`Calculated ${calculated} eco scores`);
  }
}
