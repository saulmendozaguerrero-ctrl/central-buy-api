import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('price_snapshots')
@Index(['snapshotDate'], { unique: true })
export class PriceSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  snapshotDate: string; // YYYY-MM-DD

  @Column({ type: 'float' })
  avgDiesel: number;

  @Column({ type: 'float' })
  avgGasoline95: number;

  @Column({ type: 'float', nullable: true })
  minDiesel: number;

  @Column({ type: 'float', nullable: true })
  maxDiesel: number;

  @Column({ type: 'float', nullable: true })
  minGasoline95: number;

  @Column({ type: 'float', nullable: true })
  maxGasoline95: number;

  @Column({ type: 'int', default: 0 })
  totalStations: number;

  @CreateDateColumn()
  createdAt: Date;
}
