import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';

export enum VehicleType {
  CAR = 'car',
  VAN = 'van',
  TRUCK = 'truck',
  BUS = 'bus',
  MACHINERY = 'machinery',
  BOAT = 'boat',
  OTHER = 'other',
}

export enum VehicleFuelType {
  DIESEL = 'diesel',
  GASOLINE = 'gasoline',
  LPG = 'lpg',
  ELECTRIC = 'electric',
  HYBRID = 'hybrid',
}

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'org_id' })
  organization: Organization;

  @Column({ name: 'org_id' })
  orgId: string;

  @Column({ nullable: true })
  plate: string;

  @Column({ type: 'enum', enum: VehicleType })
  type: VehicleType;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  model: string;

  @Column({ type: 'enum', enum: VehicleFuelType })
  fuelType: VehicleFuelType;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  avgConsumption: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_driver_id' })
  assignedDriver: User;

  @Column({ name: 'assigned_driver_id', nullable: true })
  assignedDriverId: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
