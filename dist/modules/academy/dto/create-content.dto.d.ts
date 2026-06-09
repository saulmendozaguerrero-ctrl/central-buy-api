import { ContentType, ContentAccessLevel } from '../entities/content.entity';
export declare class CreateContentDto {
    title: string;
    slug: string;
    type: ContentType;
    category?: string;
    content?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    accessLevel?: ContentAccessLevel;
    published?: boolean;
}
