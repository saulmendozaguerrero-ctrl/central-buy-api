import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademyContent, ContentAccessLevel } from './entities/content.entity';
import { CreateContentDto } from './dto/create-content.dto';
import { SubscriptionPlan } from '../subscriptions/entities/subscription.entity';
import { EcoPill } from './entities/eco-pill.entity';
import { EcoQuiz, QuizQuestion } from './entities/eco-quiz.entity';
import { EcoQuizAttempt, QuizAnswer } from './entities/eco-quiz-attempt.entity';
import { EcoProgress } from './entities/eco-progress.entity';
import { EcoCertificate } from './entities/eco-certificate.entity';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { EcoAcademyProgressDto } from './dto/eco-academy-progress.dto';

@Injectable()
export class AcademyService {
  constructor(
    @InjectRepository(AcademyContent)
    private readonly contentRepo: Repository<AcademyContent>,
    @InjectRepository(EcoPill)
    private readonly ecoPillRepo: Repository<EcoPill>,
    @InjectRepository(EcoQuiz)
    private readonly ecoQuizRepo: Repository<EcoQuiz>,
    @InjectRepository(EcoQuizAttempt)
    private readonly ecoAttemptRepo: Repository<EcoQuizAttempt>,
    @InjectRepository(EcoProgress)
    private readonly ecoProgressRepo: Repository<EcoProgress>,
    @InjectRepository(EcoCertificate)
    private readonly ecoCertificateRepo: Repository<EcoCertificate>,
  ) {}

  async getAll(userPlan?: SubscriptionPlan): Promise<AcademyContent[]> {
    const qb = this.contentRepo
      .createQueryBuilder('c')
      .where('c.published = true')
      .orderBy('c.createdAt', 'DESC');

    if (!userPlan) {
      qb.andWhere('c.accessLevel = :free', { free: ContentAccessLevel.FREE });
    } else if (userPlan === SubscriptionPlan.PARTICULAR) {
      qb.andWhere('c.accessLevel IN (:...levels)', {
        levels: [ContentAccessLevel.FREE, ContentAccessLevel.PARTICULAR],
      });
    }
    // EMPRESA can see all

    return qb.getMany();
  }

  async getBySlug(slug: string): Promise<AcademyContent> {
    const content = await this.contentRepo.findOne({ where: { slug, published: true } });
    if (!content) throw new NotFoundException('Content not found');
    return content;
  }

  async getCategories(): Promise<string[]> {
    const results = await this.contentRepo
      .createQueryBuilder('c')
      .select('DISTINCT c.category', 'category')
      .where('c.published = true AND c.category IS NOT NULL')
      .getRawMany();
    return results.map((r) => r.category);
  }

  async create(dto: CreateContentDto): Promise<AcademyContent> {
    const content = this.contentRepo.create(dto);
    return this.contentRepo.save(content);
  }

  async update(id: string, dto: Partial<CreateContentDto>): Promise<AcademyContent> {
    const content = await this.contentRepo.findOne({ where: { id } });
    if (!content) throw new NotFoundException('Content not found');
    Object.assign(content, dto);
    return this.contentRepo.save(content);
  }

  async delete(id: string): Promise<void> {
    await this.contentRepo.delete(id);
  }

  // ========== ECO-ACADEMY ENDPOINTS ==========

  async getEcoPills(category?: string): Promise<EcoPill[]> {
    const qb = this.ecoPillRepo
      .createQueryBuilder('pill')
      .where('pill.published = true')
      .orderBy('pill.createdAt', 'DESC');

    if (category) {
      qb.andWhere('pill.category = :category', { category });
    }

    return qb.getMany();
  }

  async getEcoPillDetail(id: string): Promise<any> {
    const pill = await this.ecoPillRepo.findOne({
      where: { id, published: true },
      relations: { quizzes: true },
    });

    if (!pill) {
      throw new NotFoundException('Eco-pill not found');
    }

    // Get associated quizzes with full details
    const quizzes = await this.ecoQuizRepo
      .createQueryBuilder('quiz')
      .leftJoinAndSelect('quiz.pills', 'pills', 'pills.id = :pillId', { pillId: id })
      .where('quiz.published = true')
      .getMany();

    return {
      ...pill,
      quizzes: quizzes.map((q) => ({
        id: q.id,
        title: q.title,
        passingScore: q.passingScore,
        timeLimit: q.timeLimit,
        questionsCount: q.questions.length,
      })),
    };
  }

  async getEcoQuizDetail(quizId: string): Promise<any> {
    const quiz = await this.ecoQuizRepo.findOne({
      where: { id: quizId, published: true },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return {
      id: quiz.id,
      title: quiz.title,
      passingScore: quiz.passingScore,
      timeLimit: quiz.timeLimit,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options,
        // correctOptionId is NOT sent to client to prevent cheating
      })),
    };
  }

  async submitQuizAttempt(
    userId: string,
    dto: SubmitQuizDto,
  ): Promise<{ attempt: EcoQuizAttempt; passed: boolean; score: number }> {
    const quiz = await this.ecoQuizRepo.findOne({
      where: { id: dto.quizId },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Server-side validation: calculate score
    let correctCount = 0;
    const answers: QuizAnswer[] = [];

    for (const answer of dto.answers) {
      const question = quiz.questions.find((q) => q.id === answer.questionId);
      if (!question) {
        throw new BadRequestException(`Question ${answer.questionId} not found in quiz`);
      }

      answers.push({
        questionId: answer.questionId,
        selectedOptionId: answer.selectedOptionId,
      });

      // Check if answer is correct (server-side validation - anti-cheat)
      if (question.correctOptionId === answer.selectedOptionId) {
        correctCount++;
      }
    }

    // Calculate score as percentage
    const score = (correctCount / quiz.questions.length) * 100;
    const passed = score >= quiz.passingScore;

    // Persist attempt
    const attempt = this.ecoAttemptRepo.create({
      userId,
      quizId: dto.quizId,
      answers,
      score,
      passed,
    });

    const savedAttempt = await this.ecoAttemptRepo.save(attempt);

    // If passed, issue certificate and update progress
    if (passed) {
      const certificateCode = `CERT-${userId.slice(0, 8)}-${Date.now()}`;
      const certificate = this.ecoCertificateRepo.create({
        userId,
        quizId: dto.quizId,
        title: `${quiz.title} - Completion Certificate`,
        certificateCode,
      });
      await this.ecoCertificateRepo.save(certificate);

      // Update user progress
      await this.updateUserProgress(userId, 'quiz', dto.quizId);
    }

    return {
      attempt: savedAttempt,
      passed,
      score,
    };
  }

  async getEcoProgress(userId: string): Promise<EcoProgress> {
    let progress = await this.ecoProgressRepo.findOne({
      where: { userId },
    });

    if (!progress) {
      // Create initial progress record
      progress = this.ecoProgressRepo.create({
        userId,
        completedPills: [],
        completedQuizzes: [],
        totalProgress: 0,
      });
      progress = await this.ecoProgressRepo.save(progress);
    }

    return progress;
  }

  async updateUserProgress(
    userId: string,
    type: 'pill' | 'quiz',
    itemId: string,
  ): Promise<EcoProgress> {
    let progress = await this.ecoProgressRepo.findOne({
      where: { userId },
    });

    if (!progress) {
      progress = this.ecoProgressRepo.create({
        userId,
        completedPills: [],
        completedQuizzes: [],
      });
    }

    if (type === 'pill') {
      if (!progress.completedPills.includes(itemId)) {
        progress.completedPills.push(itemId);
        progress.pillsCompleted = progress.completedPills.length;
      }
    } else if (type === 'quiz') {
      if (!progress.completedQuizzes.includes(itemId)) {
        progress.completedQuizzes.push(itemId);
        progress.quizzesCompleted = progress.completedQuizzes.length;
      }
    }

    // Calculate total progress (simple: average of pills and quizzes)
    // Calculate total progress (max 10 items: 5 pills + 5 quizzes)
    const totalItems = 10;
    const completedItems = progress.pillsCompleted + progress.quizzesCompleted;
    progress.totalProgress = Math.round((completedItems / totalItems) * 100);

    return this.ecoProgressRepo.save(progress);
  }

  async markPillCompleted(userId: string, dto: EcoAcademyProgressDto): Promise<EcoProgress> {
    // Verify pill exists
    const pill = await this.ecoPillRepo.findOne({
      where: { id: dto.completedPill, published: true },
    });

    if (!pill) {
      throw new NotFoundException('Eco-pill not found');
    }

    return this.updateUserProgress(userId, 'pill', dto.completedPill);
  }
}
