import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademyContent, ContentAccessLevel } from './entities/content.entity';
import { CreateContentDto } from './dto/create-content.dto';
import { SubscriptionPlan } from '../subscriptions/entities/subscription.entity';

@Injectable()
export class AcademyService {
  constructor(
    @InjectRepository(AcademyContent)
    private readonly contentRepo: Repository<AcademyContent>,
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
}
