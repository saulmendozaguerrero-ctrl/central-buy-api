import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { User } from '../../users/entities/user.entity';

export enum OrgMemberRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  VIEWER = 'viewer',
  DRIVER = 'driver',
}

@Entity('org_members')
export class OrgMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'org_id' })
  organization: Organization;

  @Column({ name: 'org_id' })
  orgId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'enum', enum: OrgMemberRole, default: OrgMemberRole.VIEWER })
  role: OrgMemberRole;

  @Column({ nullable: true })
  invitedEmail: string;

  @CreateDateColumn()
  invitedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  joinedAt: Date;
}
