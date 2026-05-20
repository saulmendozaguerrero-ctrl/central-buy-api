import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('consultants')
export class Consultant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  specialty: string;

  @Column({ nullable: true })
  calendarUrl: string;

  @Column({ default: 20 })
  maxSlotsPerWeek: number;

  @Column({ default: true })
  active: boolean;
}
