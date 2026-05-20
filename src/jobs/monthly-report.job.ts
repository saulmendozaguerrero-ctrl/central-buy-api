import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';
import { Organization } from '../modules/organizations/entities/organization.entity';
import { Report, ReportType } from '../modules/fleet/entities/report.entity';
import { FuelLog } from '../modules/fleet/entities/fuel-log.entity';

@Injectable()
export class MonthlyReportJob {
  private readonly logger = new Logger(MonthlyReportJob.name);

  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
    @InjectRepository(FuelLog)
    private readonly fuelLogRepo: Repository<FuelLog>,
  ) {}

  // Runs at 08:00 on the first Monday of every month
  @Cron('0 8 1-7 * 1')
  async generateMonthlyReports(): Promise<void> {
    const lastMonth = dayjs().subtract(1, 'month');
    const periodStart = lastMonth.startOf('month').format('YYYY-MM-DD');
    const periodEnd = lastMonth.endOf('month').format('YYYY-MM-DD');

    this.logger.log(`Generating monthly reports for ${periodStart} → ${periodEnd}`);

    const organizations = await this.orgRepo.find();

    let generated = 0;
    for (const org of organizations) {
      try {
        const existing = await this.reportRepo.findOne({
          where: { orgId: org.id, type: ReportType.MONTHLY, periodStart },
        });

        if (existing) continue;

        // Here we'd generate a PDF and upload to R2
        // For now, create the report record with a placeholder URL
        const report = this.reportRepo.create({
          orgId: org.id,
          type: ReportType.MONTHLY,
          periodStart,
          periodEnd,
        });

        await this.reportRepo.save(report);
        generated++;
      } catch (err) {
        this.logger.error(`Failed to generate report for org ${org.id}`, err);
      }
    }

    this.logger.log(`Generated ${generated} monthly reports`);
  }
}
