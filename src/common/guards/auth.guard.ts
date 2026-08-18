import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../modules/users/users.service';
import * as jwt from 'jsonwebtoken';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'cb-admin-jwt-secret-2026';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
      // Admin JWT propio — independiente de Clerk
      try {
        const payload = jwt.verify(token, ADMIN_JWT_SECRET) as any;
        if (payload?.type === 'admin-jwt' && payload?.role === 'admin') {
          request.user = { role: 'admin', email: payload.email, id: 'admin' };
          return true;
        }
      } catch {
        // No es admin JWT, continuar con Clerk
      }

      // In development mode, support a mock token format: "mock_<clerkUserId>"
      const nodeEnv = this.configService.get<string>('app.nodeEnv');

      if (nodeEnv === 'development' && token.startsWith('mock_')) {
        const clerkUserId = token.replace('mock_', '');
        const user = await this.usersService.findByClerkId(clerkUserId);

        if (!user) {
          throw new UnauthorizedException('User not found');
        }

        request.user = user;
        request.clerkUserId = clerkUserId;
        return true;
      }

      // Production: verify Clerk JWT
      const { verifyToken } = await import('@clerk/backend');
      const clerkSecretKey = this.configService.get<string>('clerk.secretKey') ?? '';

      const payload = await verifyToken(token, {
        secretKey: clerkSecretKey,
      });

      const clerkUserId = payload.sub;
      const user = await this.usersService.findByClerkId(clerkUserId);

      if (!user) {
        throw new UnauthorizedException('User not registered in Central Buy');
      }

      request.user = user;
      request.clerkUserId = clerkUserId;
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
