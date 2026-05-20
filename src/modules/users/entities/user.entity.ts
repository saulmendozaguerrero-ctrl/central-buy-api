import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';

export enum PlanType {
  PARTICULAR = 'particular',
  EMPRESA = 'empresa',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  CONSULTANT = 'consultant',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  companyName: string;

  @Column({ type: 'enum', enum: PlanType, nullable: true })
  planType: PlanType;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ nullable: true })
  sector: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ unique: true })
  clerkUserId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
