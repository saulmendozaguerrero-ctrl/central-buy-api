export declare enum ContentType {
    ARTICLE = "article",
    VIDEO = "video",
    GUIDE = "guide",
    COURSE = "course"
}
export declare enum ContentAccessLevel {
    FREE = "free",
    PARTICULAR = "particular",
    EMPRESA = "empresa"
}
export declare class AcademyContent {
    id: string;
    title: string;
    slug: string;
    type: ContentType;
    category: string;
    content: string;
    videoUrl: string;
    thumbnailUrl: string;
    accessLevel: ContentAccessLevel;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
}
