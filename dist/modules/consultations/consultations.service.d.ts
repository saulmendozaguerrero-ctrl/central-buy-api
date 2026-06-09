import { Repository } from 'typeorm';
import { Consultation } from './entities/consultation.entity';
import { Consultant } from './entities/consultant.entity';
import { BookConsultationDto } from './dto/book-consultation.dto';
import { Subscription } from '../subscriptions/entities/subscription.entity';
export declare class ConsultationsService {
    private readonly consultationRepo;
    private readonly consultantRepo;
    private readonly subscriptionRepo;
    constructor(consultationRepo: Repository<Consultation>, consultantRepo: Repository<Consultant>, subscriptionRepo: Repository<Subscription>);
    getAvailableSlots(consultantId: string, date: string): Promise<string[]>;
    book(userId: string, dto: BookConsultationDto): Promise<Consultation>;
    getMyConsultations(userId: string): Promise<Consultation[]>;
    cancel(id: string, userId: string): Promise<Consultation>;
    getConsultants(): Promise<Consultant[]>;
}
