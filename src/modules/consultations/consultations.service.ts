import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import dayjs from 'dayjs';
import { Consultation, ConsultationStatus } from './entities/consultation.entity';
import { Consultant } from './entities/consultant.entity';
import { BookConsultationDto } from './dto/book-consultation.dto';
import { Subscription, SubscriptionPlan } from '../subscriptions/entities/subscription.entity';

@Injectable()
export class ConsultationsService {
  constructor(
    @InjectRepository(Consultation)
    private readonly consultationRepo: Repository<Consultation>,
    @InjectRepository(Consultant)
    private readonly consultantRepo: Repository<Consultant>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  async getAvailableSlots(consultantId: string, date: string): Promise<string[]> {
    const consultant = await this.consultantRepo.findOne({ where: { id: consultantId } });
    if (!consultant) throw new NotFoundException('Consultant not found');

    const dayStart = dayjs(date).startOf('day');
    const dayEnd = dayjs(date).endOf('day');

    const booked = await this.consultationRepo.find({
      where: {
        consultantId: consultant.userId,
        scheduledAt: Between(dayStart.toDate(), dayEnd.toDate()) as any,
        status: ConsultationStatus.SCHEDULED,
      },
    });

    const bookedTimes = new Set(
      booked.map((c) => dayjs(c.scheduledAt).format('HH:mm')),
    );

    // Available slots: 9am–6pm every 30 minutes on working days
    const slots: string[] = [];
    for (let hour = 9; hour < 18; hour++) {
      for (const min of [0, 30]) {
        const slot = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
        if (!bookedTimes.has(slot)) slots.push(slot);
      }
    }

    return slots;
  }

  async book(userId: string, dto: BookConsultationDto): Promise<Consultation> {
    const subscription = await this.subscriptionRepo.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (!subscription) throw new BadRequestException('Active subscription required');

    // Check monthly limit: 1 session for particular, 2 for empresa
    const monthStart = dayjs().startOf('month').toDate();
    const monthEnd = dayjs().endOf('month').toDate();

    const thisMonthCount = await this.consultationRepo.count({
      where: {
        userId,
        scheduledAt: Between(monthStart, monthEnd) as any,
        status: ConsultationStatus.SCHEDULED,
      },
    });

    const maxSessions = subscription.plan === SubscriptionPlan.EMPRESA ? 2 : 1;
    if (thisMonthCount >= maxSessions) {
      throw new BadRequestException(
        `You have reached your monthly consultation limit (${maxSessions} sessions)`,
      );
    }

    const durationMin = subscription.plan === SubscriptionPlan.EMPRESA ? 30 : 15;

    const consultation = this.consultationRepo.create({
      userId,
      consultantId: dto.consultantId,
      scheduledAt: new Date(dto.scheduledAt),
      durationMin,
      notes: dto.notes,
      status: ConsultationStatus.SCHEDULED,
    });

    return this.consultationRepo.save(consultation);
  }

  async getMyConsultations(userId: string): Promise<Consultation[]> {
    return this.consultationRepo.find({
      where: { userId },
      relations: { consultant: true },
      order: { scheduledAt: 'DESC' },
    });
  }

  async cancel(id: string, userId: string): Promise<Consultation> {
    const consultation = await this.consultationRepo.findOne({
      where: { id, userId },
    });

    if (!consultation) throw new NotFoundException('Consultation not found');
    if (consultation.status !== ConsultationStatus.SCHEDULED) {
      throw new BadRequestException('Only scheduled consultations can be canceled');
    }

    const hoursUntil = dayjs(consultation.scheduledAt).diff(dayjs(), 'hours');
    if (hoursUntil < 2) {
      throw new BadRequestException('Cannot cancel with less than 2 hours notice');
    }

    consultation.status = ConsultationStatus.CANCELED;
    return this.consultationRepo.save(consultation);
  }

  async getConsultants(): Promise<Consultant[]> {
    return this.consultantRepo.find({ where: { active: true } });
  }
}
