"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademyContent = exports.ContentAccessLevel = exports.ContentType = void 0;
const typeorm_1 = require("typeorm");
var ContentType;
(function (ContentType) {
    ContentType["ARTICLE"] = "article";
    ContentType["VIDEO"] = "video";
    ContentType["GUIDE"] = "guide";
    ContentType["COURSE"] = "course";
})(ContentType || (exports.ContentType = ContentType = {}));
var ContentAccessLevel;
(function (ContentAccessLevel) {
    ContentAccessLevel["FREE"] = "free";
    ContentAccessLevel["PARTICULAR"] = "particular";
    ContentAccessLevel["EMPRESA"] = "empresa";
})(ContentAccessLevel || (exports.ContentAccessLevel = ContentAccessLevel = {}));
let AcademyContent = class AcademyContent {
    id;
    title;
    slug;
    type;
    category;
    content;
    videoUrl;
    thumbnailUrl;
    accessLevel;
    published;
    createdAt;
    updatedAt;
};
exports.AcademyContent = AcademyContent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AcademyContent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AcademyContent.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], AcademyContent.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ContentType }),
    __metadata("design:type", String)
], AcademyContent.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AcademyContent.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AcademyContent.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AcademyContent.prototype, "videoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AcademyContent.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ContentAccessLevel, default: ContentAccessLevel.PARTICULAR }),
    __metadata("design:type", String)
], AcademyContent.prototype, "accessLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], AcademyContent.prototype, "published", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AcademyContent.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AcademyContent.prototype, "updatedAt", void 0);
exports.AcademyContent = AcademyContent = __decorate([
    (0, typeorm_1.Entity)('academy_content')
], AcademyContent);
//# sourceMappingURL=content.entity.js.map