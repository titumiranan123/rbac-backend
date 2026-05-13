"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../prisma/prisma.service");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService, auditLogService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.auditLogService = auditLogService;
        this.tokenBlacklist = new Set();
        this.failedAttempts = new Map();
        this.BLOCK_DURATION_MS = 15 * 60 * 1000;
        this.MAX_ATTEMPTS = 5;
        this.ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
    }
    async register(data, ipAddress, userAgent) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser)
            throw new common_1.ConflictException('User with this email already exists');
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role || 'CUSTOMER',
                permissions: {
                    connect: data.role === 'ADMIN'
                        ? [{ name: 'view_dashboard' }, { name: 'view_users' }, { name: 'create_user' }, { name: 'edit_user' }, { name: 'delete_user' }, { name: 'suspend_user' }, { name: 'ban_user' }, { name: 'view_leads' }, { name: 'create_lead' }, { name: 'edit_lead' }, { name: 'delete_lead' }, { name: 'view_tasks' }, { name: 'create_task' }, { name: 'edit_task' }, { name: 'delete_task' }, { name: 'view_reports' }, { name: 'view_audit_log' }, { name: 'view_settings' }, { name: 'view_customer_portal' }, { name: 'view_orders' }, { name: 'view_tickets' }]
                        : data.role === 'MANAGER'
                            ? [{ name: 'view_dashboard' }, { name: 'view_users' }, { name: 'create_user' }, { name: 'edit_user' }, { name: 'view_leads' }, { name: 'create_lead' }, { name: 'edit_lead' }, { name: 'delete_lead' }, { name: 'view_tasks' }, { name: 'create_task' }, { name: 'edit_task' }, { name: 'delete_task' }, { name: 'view_reports' }, { name: 'view_audit_log' }, { name: 'view_settings' }, { name: 'view_customer_portal' }]
                            : data.role === 'AGENT'
                                ? [{ name: 'view_dashboard' }, { name: 'view_leads' }, { name: 'create_lead' }, { name: 'edit_lead' }, { name: 'view_tasks' }, { name: 'create_task' }, { name: 'edit_task' }, { name: 'view_customer_portal' }]
                                : [{ name: 'view_dashboard' }, { name: 'view_customer_portal' }, { name: 'view_orders' }, { name: 'view_tickets' }],
                },
            },
            include: { permissions: true },
        });
        await this.auditLogService.log({
            userId: user.id,
            userEmail: user.email,
            action: client_1.AuditAction.REGISTER,
            resource: 'user',
            resourceId: user.id,
            ipAddress,
            userAgent,
        });
        return this.generateTokens(user);
    }
    async login(data, ipAddress, userAgent) {
        if (this.isIpBlocked(ipAddress || 'unknown')) {
            throw new common_1.ForbiddenException('Too many failed attempts. Try again in 15 minutes.');
        }
        const user = await this.prisma.user.findUnique({
            where: { email: data.email },
            include: { permissions: true },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        if (!isPasswordValid) {
            this.recordFailedAttempt(ipAddress || 'unknown');
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive)
            throw new common_1.UnauthorizedException('Account is inactive');
        this.clearFailedAttempts(ipAddress || 'unknown');
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        await this.auditLogService.log({
            userId: user.id,
            userEmail: user.email,
            action: client_1.AuditAction.LOGIN,
            ipAddress,
            userAgent,
            status: 'success',
        });
        return this.generateTokens(user);
    }
    async refreshToken(refreshToken) {
        if (this.tokenBlacklist.has(refreshToken)) {
            throw new common_1.UnauthorizedException('Token has been revoked');
        }
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                include: { permissions: true },
            });
            if (!user || !user.isActive)
                throw new common_1.UnauthorizedException('Invalid refresh token');
            return this.generateTokens(user);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(user, refreshToken, ipAddress, userAgent) {
        this.tokenBlacklist.add(refreshToken);
        await this.auditLogService.log({
            userId: user.id,
            userEmail: user.email,
            action: client_1.AuditAction.LOGOUT,
            ipAddress,
            userAgent,
            status: 'success',
        });
        return { message: 'Logged out successfully' };
    }
    isIpBlocked(ip) {
        const attempt = this.failedAttempts.get(ip);
        if (!attempt)
            return false;
        if (Date.now() - attempt.lastAttempt > this.ATTEMPT_WINDOW_MS) {
            this.failedAttempts.delete(ip);
            return false;
        }
        return true;
    }
    recordFailedAttempt(ip) {
        const now = Date.now();
        const attempt = this.failedAttempts.get(ip);
        if (!attempt || now - attempt.lastAttempt > this.ATTEMPT_WINDOW_MS) {
            this.failedAttempts.set(ip, { count: 1, lastAttempt: now });
        }
        else {
            attempt.count += 1;
            attempt.lastAttempt = now;
            this.failedAttempts.set(ip, attempt);
        }
    }
    clearFailedAttempts(ip) {
        this.failedAttempts.delete(ip);
    }
    generateTokens(user) {
        const grantedPerms = user.grantedPermissions || [];
        const dbPerms = user.permissions?.map((p) => p.name) || [];
        const allPermissions = [...grantedPerms, ...dbPerms, user.role];
        const payload = {
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
        return { accessToken, refreshToken, user: this.mapUserProfile(user) };
    }
    mapUserProfile(user) {
        const dbPerms = user.permissions?.map((p) => p.name) || [];
        const grantedPerms = user.grantedPermissions || [];
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
            grantedPermissions: [...grantedPerms, ...dbPerms],
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        audit_log_service_1.AuditLogService])
], AuthService);
//# sourceMappingURL=auth.service.js.map