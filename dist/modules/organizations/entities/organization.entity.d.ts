import { User } from '../../users/entities/user.entity';
export declare class Organization {
    id: string;
    name: string;
    owner: User;
    ownerId: string;
    sector: string;
    country: string;
    maxUsers: number;
    createdAt: Date;
}
