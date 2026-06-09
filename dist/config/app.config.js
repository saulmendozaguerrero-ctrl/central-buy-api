"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('app', () => ({
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
    appUrl: process.env.APP_URL ?? 'http://localhost:3001',
    apiUrl: process.env.API_URL ?? 'http://localhost:3000',
    corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3001').split(','),
    jwtSecret: process.env.JWT_SECRET ?? 'dev_secret_change_in_production',
    fromEmail: process.env.FROM_EMAIL ?? 'noreply@centralbuy.com',
    resendApiKey: process.env.RESEND_API_KEY ?? '',
}));
//# sourceMappingURL=app.config.js.map