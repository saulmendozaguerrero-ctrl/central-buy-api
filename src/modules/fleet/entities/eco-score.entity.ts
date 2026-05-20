import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('eco_scores')
export class EcoScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driver_id' })
  driver: User;

  @Column({ name: 'driver_id' })
  driverId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'org_id' })
  organization: Organization;

  @Column({ name: 'org_id' })
  orgId: string;

  @Column({ type: 'date' })
  periodStart: string;

  @Column({ type: 'date' })
  periodEnd: string;

  @Column({ type: 'int' })
  score: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  avgConsumption: number;

  @Column({ nullable: true })
  totalKm: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalLiters: number;

  @Column({ type: 'jsonb', nullable: true })
  tips: string[];

  @CreateDateColumn()
  createdAt: Date;
}
