import { User } from '../../users/entities/user.entity';
export declare enum ConsultationStatus {
    SCHEDULED = "scheduled",
    COMPLETED = "completed",
    CANCELED = "canceled",
    NO_SHOW = "no_show"
}
export declare class Consultation {
    id: string;
    user: User;
    userId: string;
    consultant: User;
    consultantId: string;
    scheduledAt: Date;
    durationMin: number;
    status: ConsultationStatus;
    notes: string;
    meetingUrl: string;
    createdAt: Date;
}
