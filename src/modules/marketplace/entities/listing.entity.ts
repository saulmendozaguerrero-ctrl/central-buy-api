import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ListingType {
  OFFER = 'offer',
  DEMAND = 'demand',
}

export enum ListingStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  EXPIRED = 'expired',
}

@Entity('marketplace_listings')
export class MarketplaceListing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'enum', enum: ListingType })
  type: ListingType;

  @Column()
  product: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  volumeMt: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  pricePerMt: number;

  @Column({ default: 'EUR' })
  currency: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  deliveryTerms: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  validUntil: string;

  @Column({ type: 'enum', enum: ListingStatus, default: ListingStatus.ACTIVE })
  status: ListingStatus;

  @CreateDateColumn()
  createdAt: Date;
}
