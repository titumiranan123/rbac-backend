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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../prisma/prisma.service");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const client_1 = require("@prisma/client");
const RoleHierarchy = {
    ADMIN: 0,
    MANAGER: 1,
    AGENT: 2,
    CUSTOMER: 3,
};
let UsersService = class UsersService {
    constructor(prisma, auditLogService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
    }
    async create(data, createdBy) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser)
            throw new common_1.ForbiddenException('User with this email already exists');
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role || client_1.RoleEnum.CUSTOMER,
            },
        });
        await this.auditLogService.log({
            userId: createdBy.id,
            userEmail: createdBy.email,
            action: client_1.AuditAction.CREATE,
            resource: 'user',
            resourceId: user.id,
            newData: {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        });
        return this.sanitizeUser(user);
    }
    async findAll(page = 1, limit = 20, role, isActive) {
        const where = {};
        if (role)
            where.role = role;
        if (isActive !== undefined)
            where.isActive = isActive;
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            data: users.map((u) => this.sanitizeUser(u)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(Number(total) / limit),
            },
        };
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { permissions: true },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return this.sanitizeUser(user);
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            include: { permissions: true },
        });
    }
    async update(id, updateData, updatedBy) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const oldData = { ...user };
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: updateData,
        });
        await this.auditLogService.log({
            userId: updatedBy.id,
            userEmail: updatedBy.email,
            action: client_1.AuditAction.UPDATE,
            resource: 'user',
            resourceId: updatedUser.id,
            oldData,
            newData: updateData,
        });
        return this.sanitizeUser(updatedUser);
    }
    async remove(id, deletedBy) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.id === deletedBy.id)
            throw new common_1.ForbiddenException('Cannot delete yourself');
        const userRoleLevel = RoleHierarchy[user.role];
        const deleterRoleLevel = RoleHierarchy[deletedBy.role];
        if (deleterRoleLevel > userRoleLevel)
            throw new common_1.ForbiddenException('You do not have permission to delete this user');
        await this.auditLogService.log({
            userId: deletedBy.id,
            userEmail: deletedBy.email,
            action: client_1.AuditAction.DELETE,
            resource: 'user',
            resourceId: user.id,
            oldData: { email: user.email, role: user.role },
        });
        await this.prisma.user.delete({ where: { id } });
        return { message: 'User deleted successfully' };
    }
    async assignRole(userId, newRole, assignedBy) {
        const targetUser = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!targetUser)
            throw new common_1.NotFoundException('User not found');
        const assignedByLevel = RoleHierarchy[assignedBy.role];
        const targetUserLevel = RoleHierarchy[targetUser.role];
        const newRoleLevel = RoleHierarchy[newRole];
        if (assignedByLevel > targetUserLevel)
            throw new common_1.ForbiddenException("You do not have permission to change this user's role");
        if (newRoleLevel < assignedByLevel)
            throw new common_1.ForbiddenException('You cannot assign a role higher than your own role');
        if (assignedBy.id === userId && newRole !== targetUser.role)
            throw new common_1.ForbiddenException('Cannot change your own role');
        const oldRole = targetUser.role;
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { role: newRole },
        });
        await this.auditLogService.log({
            userId: assignedBy.id,
            userEmail: assignedBy.email,
            action: client_1.AuditAction.ROLE_CHANGE,
            resource: 'user',
            resourceId: targetUser.id,
            oldData: { role: oldRole },
            newData: { role: newRole },
        });
        return this.sanitizeUser(updatedUser);
    }
    async grantPermission(userId, permission, grantedBy) {
        const targetUser = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!targetUser)
            throw new common_1.NotFoundException('User not found');
        const grantedPermissions = targetUser.grantedPermissions || [];
        if (!grantedPermissions.includes(permission)) {
            grantedPermissions.push(permission);
            await this.prisma.user.update({
                where: { id: userId },
                data: { grantedPermissions },
            });
            await this.auditLogService.log({
                userId: grantedBy.id,
                userEmail: grantedBy.email,
                action: client_1.AuditAction.PERMISSION_CHANGE,
                resource: 'user',
                resourceId: targetUser.id,
                newData: { grantedPermission: permission },
            });
        }
        return this.findOne(userId);
    }
    async revokePermission(userId, permission, revokedBy) {
        const targetUser = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!targetUser)
            throw new common_1.NotFoundException('User not found');
        const grantedPermissions = targetUser.grantedPermissions || [];
        if (grantedPermissions.includes(permission)) {
            const updated = grantedPermissions.filter((p) => p !== permission);
            await this.prisma.user.update({
                where: { id: userId },
                data: { grantedPermissions: updated },
            });
            await this.auditLogService.log({
                userId: revokedBy.id,
                userEmail: revokedBy.email,
                action: client_1.AuditAction.PERMISSION_CHANGE,
                resource: 'user',
                resourceId: targetUser.id,
                oldData: { revokedPermission: permission },
            });
        }
        return this.findOne(userId);
    }
    sanitizeUser(user) {
        const { password, ...result } = user;
        void password;
        return result;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], UsersService);
//# sourceMappingURL=users.service.js.map