import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { EcoQuiz } from './eco-quiz.entity';

@Entity('eco_certificates')
export class EcoCertificate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  quizId: string;

  @ManyToOne(() => EcoQuiz)
  @JoinColumn({ name: 'quiz_id' })
  quiz: EcoQuiz;

  @Column()
  title: string;

  @Column()
  certificateCode: string;

  @Column({ nullable: true })
  pdfUrl: string;

  @CreateDateColumn()
  issuedAt: Date;

  @Column({ nullable: true })
  validUntil: Date;
}
