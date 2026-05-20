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

@Entity('price_configs')
export class PriceConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  product: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  purchasePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  operatingCosts: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  desiredMargin: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  recommendedPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  zoneAvgPrice: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
