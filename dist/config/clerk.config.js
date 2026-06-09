"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('clerk', () => ({
    secretKey: process.env.CLERK_SECRET_KEY ?? '',
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY ?? '',
    webhookSecret: process.env.CLERK_WEBHOOK_SECRET ?? '',
}));
//# sourceMappingURL=clerk.config.js.map