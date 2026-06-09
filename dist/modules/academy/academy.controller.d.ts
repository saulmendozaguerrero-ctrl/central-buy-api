import { AcademyService } from './academy.service';
import { CreateContentDto } from './dto/create-content.dto';
import { User } from '../users/entities/user.entity';
export declare class AcademyController {
    private readonly academyService;
    constructor(academyService: AcademyService);
    getAll(user: User): Promise<import("./entities/content.entity").AcademyContent[]>;
    getBySlug(slug: string): Promise<import("./entities/content.entity").AcademyContent>;
    getCategories(): Promise<string[]>;
    create(dto: CreateContentDto): Promise<import("./entities/content.entity").AcademyContent>;
    update(id: string, dto: Partial<CreateContentDto>): Promise<import("./entities/content.entity").AcademyContent>;
    delete(id: string): Promise<{
        deleted: boolean;
    }>;
}
