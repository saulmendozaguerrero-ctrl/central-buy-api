import { Repository } from 'typeorm';
import { AcademyContent } from './entities/content.entity';
import { CreateContentDto } from './dto/create-content.dto';
import { SubscriptionPlan } from '../subscriptions/entities/subscription.entity';
export declare class AcademyService {
    private readonly contentRepo;
    constructor(contentRepo: Repository<AcademyContent>);
    getAll(userPlan?: SubscriptionPlan): Promise<AcademyContent[]>;
    getBySlug(slug: string): Promise<AcademyContent>;
    getCategories(): Promise<string[]>;
    create(dto: CreateContentDto): Promise<AcademyContent>;
    update(id: string, dto: Partial<CreateContentDto>): Promise<AcademyContent>;
    delete(id: string): Promise<void>;
}
