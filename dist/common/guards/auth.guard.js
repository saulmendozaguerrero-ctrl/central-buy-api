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
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../../modules/users/users.service");
let AuthGuard = class AuthGuard {
    configService;
    usersService;
    constructor(configService, usersService) {
        this.configService = configService;
        this.usersService = usersService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        if (!authHeader?.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Missing authorization header');
        }
        const token = authHeader.split(' ')[1];
        try {
            const nodeEnv = this.configService.get('app.nodeEnv');
            if (nodeEnv === 'development' && token.startsWith('mock_')) {
                const clerkUserId = token.replace('mock_', '');
                const user = await this.usersService.findByClerkId(clerkUserId);
                if (!user) {
                    throw new common_1.UnauthorizedException('User not found');
                }
                request.user = user;
                request.clerkUserId = clerkUserId;
                return true;
            }
            const { verifyToken } = await import('@clerk/backend');
            const clerkSecretKey = this.configService.get('clerk.secretKey') ?? '';
            const payload = await verifyToken(token, {
                secretKey: clerkSecretKey,
            });
            const clerkUserId = payload.sub;
            const user = await this.usersService.findByClerkId(clerkUserId);
            if (!user) {
                throw new common_1.UnauthorizedException('User not registered in Central Buy');
            }
            request.user = user;
            request.clerkUserId = clerkUserId;
            return true;
        }
        catch (err) {
            if (err instanceof common_1.UnauthorizedException)
                throw err;
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        users_service_1.UsersService])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map