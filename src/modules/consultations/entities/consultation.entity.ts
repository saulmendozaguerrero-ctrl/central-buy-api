import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ConsultationStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
  NO_SHOW = 'no_show',
}

@Entity('consultations')
export class Consultation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'consultant_id' })
  consultant: User;

  @Column({ name: 'consultant_id', nullable: true })
  consultantId: string;

  @Column({ type: 'timestamptz' })
  scheduledAt: Date;

  @Column({ default: 15 })
  durationMin: number;

  @Column({ type: 'enum', enum: ConsultationStatus, default: ConsultationStatus.SCHEDULED })
  status: ConsultationStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  meetingUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
