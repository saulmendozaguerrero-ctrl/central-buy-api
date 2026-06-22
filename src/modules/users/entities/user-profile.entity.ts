import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  // Particulares
  @Column({ nullable: true })
  numberOfTripsMonthly?: number;

  @Column({ type: 'simple-array', nullable: true })
  fuelTypes?: string[]; // ['diesel', 'gasoline', 'lpg']

  @Column({ nullable: true })
  primaryLocation?: string;

  @Column({ nullable: true })
  phoneNotifications?: boolean;

  @Column({ nullable: true })
  emailNotifications?: boolean;

  // Empresas
  @Column({ nullable: true })
  taxId?: string; // CIF/NIF

  @Column({ nullable: true })
  companySize?: string; // '1-10', '11-50', '50+'

  @Column({ nullable: true })
  monthlyVolumeLiters?: number;

  @Column({ type: 'simple-array', nullable: true })
  locations?: string[]; // múltiples ubicaciones

  @Column({ nullable: true })
  teamSize?: number;

  @Column({ nullable: true })
  alertsEnabled?: boolean;

  // Común
  @Column({ default: false })
  onboardingCompleted: boolean;

  @Column({ type: 'simple-json', nullable: true })
  preferencesData?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
