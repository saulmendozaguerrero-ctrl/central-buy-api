import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Custom rate limiting guard with configurable limits per endpoint
 * Usage: @UseGuards(new RateLimitGuard({ windowMs: 60000, maxRequests: 10 }))
 */
@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const endpoint = `${request.method} ${request.path}`;

    // Different limits for different endpoints
    const limits: Record<string, { windowMs: number; maxRequests: number }> = {
      'POST /api/consultations': { windowMs: 60000, maxRequests: 5 }, // 5 per minute
      'POST /api/prices/update-daily': { windowMs: 3600000, maxRequests: 2 }, // 2 per hour
      'POST /auth/sign-up': { windowMs: 3600000, maxRequests: 5 }, // 5 per hour
      'POST /auth/sign-in': { windowMs: 3600000, maxRequests: 10 }, // 10 per hour (brute force protection)
      'GET /api/prices/latest': { windowMs: 5000, maxRequests: 100 }, // 100 per 5s (public, allow bulk)
    };

    const limit = limits[endpoint] || { windowMs: 60000, maxRequests: 100 }; // Default

    // Simple in-memory rate limiting (production: use Redis)
    const key = `${request.ip}:${endpoint}`;
    const count = this.getRateLimit(key);

    if (count >= limit.maxRequests) {
      throw new BadRequestException(`Rate limit exceeded for ${endpoint}`);
    }

    this.incrementRateLimit(key, limit.windowMs);
    return true;
  }

  private rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  private getRateLimit(key: string): number {
    const data = this.rateLimitMap.get(key);
    if (!data || data.resetTime < Date.now()) {
      return 0;
    }
    return data.count;
  }

  private incrementRateLimit(key: string, windowMs: number): void {
    const data = this.rateLimitMap.get(key);
    if (!data || data.resetTime < Date.now()) {
      this.rateLimitMap.set(key, { count: 1, resetTime: Date.now() + windowMs });
    } else {
      data.count++;
    }
  }
}
