import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EcoQuiz } from './eco-quiz.entity';
import { User } from '../../users/entities/user.entity';

export interface QuizAnswer {
  questionId: string;
  selectedOptionId: string;
}

@Entity('eco_quiz_attempts')
export class EcoQuizAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  quizId: string;

  @ManyToOne(() => EcoQuiz, (quiz) => quiz.attempts)
  @JoinColumn({ name: 'quiz_id' })
  quiz: EcoQuiz;

  @Column({ type: 'jsonb', default: [] })
  answers: QuizAnswer[];

  @Column({ type: 'float' })
  score: number;

  @Column()
  passed: boolean;

  @CreateDateColumn()
  completedAt: Date;
}
