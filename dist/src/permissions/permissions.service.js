"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const client_1 = require("@prisma/client");
const RoleHierarchy = {
    ADMIN: 0,
    MANAGER: 1,
    AGENT: 2,
    CUSTOMER: 3,
};
let PermissionsService = class PermissionsService {
    constructor(prisma, auditLogService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
    }
    async findAll() {
        return this.prisma.permission.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                resource: true,
                action: true,
                level: true,
                isActive: true,
            },
            orderBy: [{ resource: 'asc' }, { action: 'asc' }],
        });
    }
    async findOne(id) {
        const permission = await this.prisma.permission.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                description: true,
                resource: true,
                action: true,
                level: true,
                isActive: true,
            },
        });
        if (!permission)
            throw new common_1.NotFoundException('Permission not found');
        return permission;
    }
    async create(data, createdBy) {
        const userLevel = RoleHierarchy[createdBy.role];
        if (userLevel > 0)
            throw new common_1.ForbiddenException('Only Admin can create permissions');
        if (data.level < userLevel)
            throw new common_1.ForbiddenException('Cannot create permission with level higher than your role');
        const permission = await this.prisma.permission.create({
            data,
            select: {
                id: true,
                name: true,
                description: true,
                resource: true,
                action: true,
                level: true,
                isActive: true,
            },
        });
        await this.auditLogService.log({
            userId: createdBy.id,
            userEmail: createdBy.email,
            action: client_1.AuditAction.CREATE,
            resource: 'permission',
            resourceId: permission.id,
            newData: data,
        });
        return permission;
    }
    async update(id, updateData, updatedBy) {
        const permission = await this.prisma.permission.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                description: true,
                resource: true,
                action: true,
                level: true,
                isActive: true,
            },
        });
        if (!permission)
            throw new common_1.NotFoundException('Permission not found');
        const userLevel = RoleHierarchy[updatedBy.role];
        if (userLevel > 0)
            throw new common_1.ForbiddenException('Only Admin can update permissions');
        if (updateData.level !== undefined && updateData.level < userLevel)
            throw new common_1.ForbiddenException('Cannot set permission level higher than your role');
        const updatedPermission = await this.prisma.permission.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                description: true,
                resource: true,
                action: true,
                level: true,
                isActive: true,
            },
        });
        await this.auditLogService.log({
            userId: updatedBy.id,
            userEmail: updatedBy.email,
            action: client_1.AuditAction.UPDATE,
            resource: 'permission',
            resourceId: updatedPermission.id,
            oldData: permission,
            newData: updateData,
        });
        return updatedPermission;
    }
    async remove(id, deletedBy) {
        const permission = await this.prisma.permission.findUnique({
            where: { id },
            select: { id: true, name: true },
        });
        if (!permission)
            throw new common_1.NotFoundException('Permission not found');
        const userLevel = RoleHierarchy[deletedBy.role];
        if (userLevel > 0)
            throw new common_1.ForbiddenException('Only Admin can delete permissions');
        await this.auditLogService.log({
            userId: deletedBy.id,
            userEmail: deletedBy.email,
            action: client_1.AuditAction.DELETE,
            resource: 'permission',
            resourceId: permission.id,
            oldData: { name: permission.name },
        });
        await this.prisma.permission.delete({ where: { id } });
        return { message: 'Permission deleted successfully' };
    }
    async getGrantable(user) {
        if (user.role === 'ADMIN') {
            return this.prisma.permission.findMany({
                select: {
                    id: true,
                    name: true,
                    description: true,
                    resource: true,
                    action: true,
                    level: true,
                    isActive: true,
                },
            });
        }
        if (user.role === 'MANAGER') {
            const rolePermissions = await this.prisma.rolePermission.findMany({
                where: { role: user.role },
                include: { permission: true },
            });
            const grantedPermissions = await this.prisma.user.findUnique({
                where: { id: user.id },
                select: { grantedPermissions: true },
            });
            const userPermNames = [
                ...rolePermissions.map((rp) => rp.permission.name),
                ...(grantedPermissions?.grantedPermissions || []),
            ];
            return this.prisma.permission.findMany({
                where: { name: { in: userPermNames } },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    resource: true,
                    action: true,
                    level: true,
                    isActive: true,
                },
            });
        }
        return [];
    }
    async grant(userId, permissionName, grantedBy) {
        if (grantedBy.role === 'AGENT' || grantedBy.role === 'CUSTOMER') {
            throw new common_1.ForbiddenException('You cannot grant permissions');
        }
        if (grantedBy.role === 'MANAGER') {
            const managerRolePermissions = await this.prisma.rolePermission.findMany({
                where: { role: grantedBy.role },
                include: { permission: true },
            });
            const managerGrantedPermissions = await this.prisma.user.findUnique({
                where: { id: grantedBy.id },
                select: { grantedPermissions: true },
            });
            const managerPermNames = [
                ...managerRolePermissions.map((rp) => rp.permission.name),
                ...(managerGrantedPermissions?.grantedPermissions || []),
            ];
            if (!managerPermNames.includes(permissionName)) {
                throw new common_1.ForbiddenException('You can only grant permissions you have');
            }
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const currentPerms = user.grantedPermissions || [];
        if (!currentPerms.includes(permissionName)) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { grantedPermissions: { push: permissionName } },
            });
            await this.auditLogService.log({
                userId: grantedBy.id,
                userEmail: grantedBy.email,
                action: client_1.AuditAction.PERMISSION_CHANGE,
                resource: 'user',
                resourceId: userId,
                newData: { grantedPermission: permissionName },
            });
        }
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                grantedPermissions: true,
            },
        });
    }
    async revoke(userId, permissionName, revokedBy) {
        if (revokedBy.role === 'AGENT' || revokedBy.role === 'CUSTOMER') {
            throw new common_1.ForbiddenException('You cannot revoke permissions');
        }
        if (revokedBy.role === 'MANAGER') {
            const managerRolePermissions = await this.prisma.rolePermission.findMany({
                where: { role: revokedBy.role },
                include: { permission: true },
            });
            const managerGrantedPermissions = await this.prisma.user.findUnique({
                where: { id: revokedBy.id },
                select: { grantedPermissions: true },
            });
            const managerPermNames = [
                ...managerRolePermissions.map((rp) => rp.permission.name),
                ...(managerGrantedPermissions?.grantedPermissions || []),
            ];
            if (!managerPermNames.includes(permissionName)) {
                throw new common_1.ForbiddenException('You can only revoke permissions you have');
            }
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const currentPerms = user.grantedPermissions || [];
        if (currentPerms.includes(permissionName)) {
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    grantedPermissions: currentPerms.filter((p) => p !== permissionName),
                },
            });
            await this.auditLogService.log({
                userId: revokedBy.id,
                userEmail: revokedBy.email,
                action: client_1.AuditAction.PERMISSION_CHANGE,
                resource: 'user',
                resourceId: userId,
                oldData: { revokedPermission: permissionName },
            });
        }
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                grantedPermissions: true,
            },
        });
    }
    canGrantPermission(user, permissionLevel) {
        const userLevel = RoleHierarchy[user.role];
        if (userLevel === 0)
            return true;
        if (userLevel === 1 && permissionLevel >= 1)
            return true;
        return false;
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map