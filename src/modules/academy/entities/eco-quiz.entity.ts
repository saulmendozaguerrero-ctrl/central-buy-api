import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { EcoPill } from './eco-pill.entity';
import { EcoQuizAttempt } from './eco-quiz-attempt.entity';

export interface QuizQuestion {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId: string;
}

@Entity('eco_quizzes')
export class EcoQuiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'jsonb', default: [] })
  questions: QuizQuestion[];

  @Column({ type: 'float', default: 70 })
  passingScore: number;

  @Column({ nullable: true })
  timeLimit: number; // in minutes

  @ManyToMany(() => EcoPill, (pill) => pill.quizzes)
  @JoinTable({
    name: 'eco_quiz_pills',
    joinColumn: { name: 'quiz_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'pill_id', referencedColumnName: 'id' },
  })
  pills: EcoPill[];

  @OneToMany(() => EcoQuizAttempt, (attempt) => attempt.quiz)
  attempts: EcoQuizAttempt[];

  @Column({ default: true })
  published: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
