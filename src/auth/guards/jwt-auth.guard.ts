import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenPayload, UserWithPermissions } from '../../types';
import { blacklistedTokens } from '../blacklist';

interface AuthRequest extends Request {
  user?: UserWithPermissions;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  // Verifies JWT token and attaches user to request
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('No token provided');
    if (blacklistedTokens.has(token))
      throw new UnauthorizedException('Token has been revoked');
    try {
      const payload = this.jwtService.verify<TokenPayload>(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { permissions: true },
      });
      if (!user || !user.isActive)
        throw new UnauthorizedException('User not found or inactive');
      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // Extracts Bearer token from Authorization header or cookie
  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token) return token;
    }
    const cookies = request.headers.cookie;
    if (cookies) {
      const match = cookies.match(/accessToken=([^;]+)/);
      if (match) return match[1];
    }
    return undefined;
  }
}
