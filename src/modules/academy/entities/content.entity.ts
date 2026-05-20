import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ContentType {
  ARTICLE = 'article',
  VIDEO = 'video',
  GUIDE = 'guide',
  COURSE = 'course',
}

export enum ContentAccessLevel {
  FREE = 'free',
  PARTICULAR = 'particular',
  EMPRESA = 'empresa',
}

@Entity('academy_content')
export class AcademyContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'enum', enum: ContentType })
  type: ContentType;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'enum', enum: ContentAccessLevel, default: ContentAccessLevel.PARTICULAR })
  accessLevel: ContentAccessLevel;

  @Column({ default: false })
  published: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
