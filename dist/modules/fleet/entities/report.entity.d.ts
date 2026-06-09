import { Organization } from '../../organizations/entities/organization.entity';
export declare enum ReportType {
    MONTHLY = "monthly",
    CUSTOM = "custom"
}
export declare class Report {
    id: string;
    organization: Organization;
    orgId: string;
    type: ReportType;
    periodStart: string;
    periodEnd: string;
    fileUrl: string | null;
    generatedAt: Date;
}
