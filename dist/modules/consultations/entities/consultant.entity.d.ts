import { User } from '../../users/entities/user.entity';
export declare class Consultant {
    id: string;
    user: User;
    userId: string;
    name: string;
    specialty: string;
    calendarUrl: string;
    maxSlotsPerWeek: number;
    active: boolean;
}
