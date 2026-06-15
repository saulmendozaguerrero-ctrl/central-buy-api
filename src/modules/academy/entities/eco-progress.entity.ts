import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('eco_progress')
export class EcoProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'jsonb', default: [] })
  completedPills: string[]; // array of pill IDs

  @Column({ type: 'jsonb', default: [] })
  completedQuizzes: string[]; // array of quiz IDs

  @Column({ type: 'float', default: 0 })
  totalProgress: number; // percentage

  @Column({ default: 0 })
  pillsCompleted: number;

  @Column({ default: 0 })
  quizzesCompleted: number;

  @Column({ default: 0 })
  certificatesEarned: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
