import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { RegisterInput, LoginInput } from './dto/auth.dto';
import { AuthTokens, UserProfile } from '../types';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    private auditLogService;
    private failedAttempts;
    private readonly MAX_ATTEMPTS;
    private readonly ATTEMPT_WINDOW_MS;
    private readonly BLOCK_DURATION_MS;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, auditLogService: AuditLogService);
    register(data: RegisterInput): Promise<AuthTokens>;
    login(data: LoginInput, ipAddress?: string, userAgent?: string): Promise<AuthTokens>;
    refreshToken(refreshToken: string): Promise<AuthTokens>;
    logout(user: UserProfile, refreshToken: string, accessToken: string, ipAddress?: string, userAgent?: string): Promise<{
        message: string;
    }>;
    private isIpBlocked;
    private recordFailedAttempt;
    private clearFailedAttempts;
    private generateTokens;
    private mapUserProfile;
}
