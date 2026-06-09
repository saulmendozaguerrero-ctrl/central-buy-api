import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';
export declare class EcoScore {
    id: string;
    driver: User;
    driverId: string;
    organization: Organization;
    orgId: string;
    periodStart: string;
    periodEnd: string;
    score: number;
    avgConsumption: number;
    totalKm: number;
    totalLiters: number;
    tips: string[];
    createdAt: Date;
}
