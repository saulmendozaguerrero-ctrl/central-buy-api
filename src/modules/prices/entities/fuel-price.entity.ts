import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum FuelProduct {
  DIESEL = 'diesel',
  GASOLINE = 'gasoline',
  FUEL_OIL = 'fuel_oil',
  BIODIESEL = 'biodiesel',
  JET_FUEL = 'jet_fuel',
  CRUDE = 'crude',
}

export enum FuelRegion {
  EUROPE = 'europe',
  LATAM = 'latam',
  MIDDLE_EAST = 'middle_east',
  ASIA = 'asia',
  AFRICA = 'africa',
  NORTH_AMERICA = 'north_america',
}

@Entity('fuel_prices')
@Index(['product', 'region', 'priceDate'])
export class FuelPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: FuelProduct })
  product: FuelProduct;

  @Column({ type: 'enum', enum: FuelRegion })
  region: FuelRegion;

  @Column({ nullable: true })
  country: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  priceUsd: number;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  priceEur: number;

  @Column({ default: 'metric_ton' })
  unit: string;

  @Column({ default: 'manual' })
  source: string;

  @Column({ type: 'date' })
  priceDate: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;
}
