import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction, RoleEnum } from '@prisma/client';
import { RegisterInput, LoginInput } from './dto/auth.dto';
import {
  TokenPayload,
  AuthTokens,
  UserProfile,
  UserWithPermissions,
} from '../types';

interface FailedAttempt {
  count: number;
  lastAttempt: number;
}

@Injectable()
export class AuthService {
  private tokenBlacklist = new Set<string>();
  private failedAttempts = new Map<string, FailedAttempt>();
  private readonly BLOCK_DURATION_MS = 15 * 60 * 1000;
  private readonly MAX_ATTEMPTS = 5;
  private readonly ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditLogService: AuditLogService,
  ) {}

  async register(
    data: RegisterInput,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthTokens> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser)
      throw new ConflictException('User with this email already exists');
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || RoleEnum.CUSTOMER,
      },
      include: { permissions: true },
    });
    await this.auditLogService.log({
      userId: user.id,
      userEmail: user.email,
      action: AuditAction.REGISTER,
      resource: 'user',
      resourceId: user.id,
      ipAddress,
      userAgent,
    });
    return this.generateTokens(user);
  }

  async login(
    data: LoginInput,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthTokens> {
    if (this.isIpBlocked(ipAddress || 'unknown')) {
      throw new ForbiddenException(
        'Too many failed attempts. Try again in 15 minutes.',
      );
    }
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
      include: { permissions: true },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      this.recordFailedAttempt(ipAddress || 'unknown');
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isActive) throw new UnauthorizedException('Account is inactive');
    this.clearFailedAttempts(ipAddress || 'unknown');
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    await this.auditLogService.log({
      userId: user.id,
      userEmail: user.email,
      action: AuditAction.LOGIN,
      ipAddress,
      userAgent,
      status: 'success',
    });
    return this.generateTokens(user);
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    if (this.tokenBlacklist.has(refreshToken)) {
      throw new UnauthorizedException('Token has been revoked');
    }
    try {
      const payload = this.jwtService.verify<TokenPayload>(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { permissions: true },
      });
      if (!user || !user.isActive)
        throw new UnauthorizedException('Invalid refresh token');
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(
    user: UserProfile,
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    this.tokenBlacklist.add(refreshToken);
    await this.auditLogService.log({
      userId: user.id,
      userEmail: user.email,
      action: AuditAction.LOGOUT,
      ipAddress,
      userAgent,
      status: 'success',
    });
    return { message: 'Logged out successfully' };
  }

  private isIpBlocked(ip: string): boolean {
    const attempt = this.failedAttempts.get(ip);
    if (!attempt) return false;
    if (Date.now() - attempt.lastAttempt > this.ATTEMPT_WINDOW_MS) {
      this.failedAttempts.delete(ip);
      return false;
    }
    return true;
  }

  private recordFailedAttempt(ip: string): void {
    const now = Date.now();
    const attempt = this.failedAttempts.get(ip);
    if (!attempt || now - attempt.lastAttempt > this.ATTEMPT_WINDOW_MS) {
      this.failedAttempts.set(ip, { count: 1, lastAttempt: now });
    } else {
      attempt.count += 1;
      attempt.lastAttempt = now;
      this.failedAttempts.set(ip, attempt);
    }
  }

  private clearFailedAttempts(ip: string): void {
    this.failedAttempts.delete(ip);
  }

  private async generateTokens(user: UserWithPermissions): Promise<AuthTokens> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { role: user.role },
      include: { permission: true },
    });
    const rolePerms = rolePermissions.map((rp) => rp.permission.name);
    const dbPerms = user.permissions?.map((p) => p.name) || [];
    const grantedPerms = user.grantedPermissions || [];
    const allPermissions = [
      ...rolePerms,
      ...grantedPerms,
      ...dbPerms,
      user.role,
    ];

    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      grantedPermissions: allPermissions,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      user: this.mapUserProfile(user, rolePerms),
    };
  }

  private mapUserProfile(
    user: UserWithPermissions,
    rolePerms: string[] = [],
  ): UserProfile {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      grantedPermissions: [...rolePerms, ...(user.grantedPermissions || [])],
    };
  }
}
