import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import * as jwt from 'jsonwebtoken';

const ADMIN_EMAIL = 'info@spfo.es';
const ADMIN_PASSWORD = 'SPFO2026';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'cb-admin-jwt-secret-2026';

@ApiTags('Admin Auth')
@Controller('admin')
export class AdminAuthController {
  @Post('login')
  @ApiOperation({ summary: 'Admin login — devuelve JWT propio' })
  login(@Body() body: { email: string; password: string }) {
    if (
      body.email?.toLowerCase().trim() !== ADMIN_EMAIL ||
      body.password !== ADMIN_PASSWORD
    ) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const token = jwt.sign(
      { sub: 'admin', email: ADMIN_EMAIL, role: 'admin', type: 'admin-jwt' },
      ADMIN_JWT_SECRET,
      { expiresIn: '8h' },
    );

    return { ok: true, token };
  }
}
