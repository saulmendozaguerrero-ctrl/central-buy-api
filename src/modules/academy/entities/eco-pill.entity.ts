import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { EcoQuiz } from './eco-quiz.entity';

export enum EcoPillCategory {
  ECO_DRIVING = 'eco-driving',
  FLEET_MANAGEMENT = 'fleet-management',
  SUSTAINABILITY = 'sustainability',
  EMISSIONS = 'emissions',
}

export enum EcoDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Entity('eco_pills')
export class EcoPill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  slug: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  excerpt: string;

  @Column({ type: 'enum', enum: EcoPillCategory, default: EcoPillCategory.ECO_DRIVING })
  category: EcoPillCategory;

  @Column({ nullable: true })
  durationMin: number;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: 'enum', enum: EcoDifficulty, default: EcoDifficulty.BEGINNER })
  difficulty: EcoDifficulty;

  @Column({ default: 'empresa' })
  accessLevel: string; // 'free' | 'particular' | 'empresa'

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ default: true })
  published: boolean;

  @ManyToMany(() => EcoQuiz, (quiz) => quiz.pills)
  quizzes: EcoQuiz[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
