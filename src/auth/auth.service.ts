import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction } from '@prisma/client';
import { RegisterInput, LoginInput } from './dto/auth.dto';
import {
  TokenPayload,
  AuthTokens,
  UserProfile,
  UserWithPermissions,
} from '../types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditLogService: AuditLogService,
  ) {}

  // Hashes password and creates new user with audit log
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
      },
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
    return this.generateTokens(user as UserWithPermissions);
  }

  // Verifies password and returns JWT tokens with audit log
  async login(
    data: LoginInput,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
      include: { permissions: true },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account is inactive');
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

  // Validates refresh token and issues new access token
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
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

  // Logs user logout with audit trail
  async logout(user: UserProfile, ipAddress?: string, userAgent?: string) {
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

  // Creates and signs JWT access and refresh tokens
  private generateTokens(user: UserWithPermissions): AuthTokens {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });
    return { accessToken, refreshToken, user: this.mapUserProfile(user) };
  }

  // Converts user object to UserProfile without sensitive data
  private mapUserProfile(user: UserWithPermissions): UserProfile {
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
    };
  }
}
