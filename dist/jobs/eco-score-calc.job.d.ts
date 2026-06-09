import { Repository } from 'typeorm';
import { OrgMember } from '../modules/organizations/entities/org-member.entity';
import { EcoScoreService } from '../modules/fleet/eco-score.service';
export declare class EcoScoreCalcJob {
    private readonly memberRepo;
    private readonly ecoScoreService;
    private readonly logger;
    constructor(memberRepo: Repository<OrgMember>, ecoScoreService: EcoScoreService);
    calculateWeeklyEcoScores(): Promise<void>;
}
