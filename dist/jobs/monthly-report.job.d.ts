import { Repository } from 'typeorm';
import { Organization } from '../modules/organizations/entities/organization.entity';
import { Report } from '../modules/fleet/entities/report.entity';
import { FuelLog } from '../modules/fleet/entities/fuel-log.entity';
export declare class MonthlyReportJob {
    private readonly orgRepo;
    private readonly reportRepo;
    private readonly fuelLogRepo;
    private readonly logger;
    constructor(orgRepo: Repository<Organization>, reportRepo: Repository<Report>, fuelLogRepo: Repository<FuelLog>);
    generateMonthlyReports(): Promise<void>;
}
