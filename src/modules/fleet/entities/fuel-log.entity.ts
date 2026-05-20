import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('fuel_logs')
export class FuelLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vehicle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ name: 'vehicle_id' })
  vehicleId: string;

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

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  liters: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costEur: number;

  @Column({ nullable: true })
  odometerKm: number;

  @Column({ nullable: true })
  stationName: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  fuelType: string;

  @Column({ type: 'timestamptz' })
  loggedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
