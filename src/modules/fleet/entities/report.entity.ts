import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';

export enum ReportType {
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'org_id' })
  organization: Organization;

  @Column({ name: 'org_id' })
  orgId: string;

  @Column({ type: 'enum', enum: ReportType, default: ReportType.MONTHLY })
  type: ReportType;

  @Column({ type: 'date' })
  periodStart: string;

  @Column({ type: 'date' })
  periodEnd: string;

  @Column({ nullable: true, type: 'varchar' })
  fileUrl: string | null;

  @CreateDateColumn()
  generatedAt: Date;
}
