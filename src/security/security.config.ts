import { ConfigService } from '@nestjs/config';

/**
 * Security configuration for CORS, headers, input validation
 */
export class SecurityConfig {
  static getCorsOptions(config: ConfigService) {
    const corsOrigins = config.get<string>('CORS_ORIGINS') || 'http://localhost:3000';
    const origins = corsOrigins.split(',').map((o) => o.trim());

    return {
      origin: origins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
      exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
      maxAge: 86400, // 24 hours
    };
  }

  static getHelmetOptions() {
    return {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    };
  }

  static getInputValidationRules() {
    return {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^(\+\d{1,3})?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
      company: /^[a-zA-Z0-9\s\-\.]{3,100}$/,
      message: { minLength: 10, maxLength: 5000 },
      password: { minLength: 8, pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/ }, // min 8, 1 upper, 1 lower, 1 digit
    };
  }
}
