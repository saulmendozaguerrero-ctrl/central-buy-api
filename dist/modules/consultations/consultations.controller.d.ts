import { ConsultationsService } from './consultations.service';
import { BookConsultationDto } from './dto/book-consultation.dto';
import { User } from '../users/entities/user.entity';
export declare class ConsultationsController {
    private readonly consultationsService;
    constructor(consultationsService: ConsultationsService);
    getConsultants(): Promise<import("./entities/consultant.entity").Consultant[]>;
    getSlots(consultantId: string, date: string): Promise<string[]>;
    book(dto: BookConsultationDto, user: User): Promise<import("./entities/consultation.entity").Consultation>;
    getMy(user: User): Promise<import("./entities/consultation.entity").Consultation[]>;
    cancel(id: string, user: User): Promise<import("./entities/consultation.entity").Consultation>;
}
