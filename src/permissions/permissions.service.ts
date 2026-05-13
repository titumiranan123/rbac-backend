import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction, RoleEnum } from '@prisma/client';
import {
  UserProfile,
  CreatePermissionData,
  UpdatePermissionData,
} from '../types';

const RoleHierarchy: Record<RoleEnum, number> = {
  ADMIN: 0,
  MANAGER: 1,
  AGENT: 2,
  CUSTOMER: 3,
};

@Injectable()
export class PermissionsService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

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

  async findOne(id: string) {
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
    if (!permission) throw new NotFoundException('Permission not found');
    return permission;
  }

  async create(data: CreatePermissionData, createdBy: UserProfile) {
    const userLevel = RoleHierarchy[createdBy.role];
    if (userLevel > 0)
      throw new ForbiddenException('Only Admin can create permissions');
    if (data.level < userLevel)
      throw new ForbiddenException(
        'Cannot create permission with level higher than your role',
      );
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
      action: AuditAction.CREATE,
      resource: 'permission',
      resourceId: permission.id,
      newData: data,
    });
    return permission;
  }

  async update(
    id: string,
    updateData: UpdatePermissionData,
    updatedBy: UserProfile,
  ) {
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
    if (!permission) throw new NotFoundException('Permission not found');
    const userLevel = RoleHierarchy[updatedBy.role];
    if (userLevel > 0)
      throw new ForbiddenException('Only Admin can update permissions');
    if (updateData.level !== undefined && updateData.level < userLevel)
      throw new ForbiddenException(
        'Cannot set permission level higher than your role',
      );
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
      action: AuditAction.UPDATE,
      resource: 'permission',
      resourceId: updatedPermission.id,
      oldData: permission,
      newData: updateData,
    });
    return updatedPermission;
  }

  async remove(id: string, deletedBy: UserProfile) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!permission) throw new NotFoundException('Permission not found');
    const userLevel = RoleHierarchy[deletedBy.role];
    if (userLevel > 0)
      throw new ForbiddenException('Only Admin can delete permissions');
    await this.auditLogService.log({
      userId: deletedBy.id,
      userEmail: deletedBy.email,
      action: AuditAction.DELETE,
      resource: 'permission',
      resourceId: permission.id,
      oldData: { name: permission.name },
    });
    await this.prisma.permission.delete({ where: { id } });
    return { message: 'Permission deleted successfully' };
  }

  async getGrantable(user: UserProfile) {
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

  async grant(userId: string, permissionName: string, grantedBy: UserProfile) {
    if (grantedBy.role === 'AGENT' || grantedBy.role === 'CUSTOMER') {
      throw new ForbiddenException('You cannot grant permissions');
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
        throw new ForbiddenException('You can only grant permissions you have');
      }
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const currentPerms = user.grantedPermissions || [];
    if (!currentPerms.includes(permissionName)) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { grantedPermissions: { push: permissionName } },
      });
      await this.auditLogService.log({
        userId: grantedBy.id,
        userEmail: grantedBy.email,
        action: AuditAction.PERMISSION_CHANGE,
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

  async revoke(userId: string, permissionName: string, revokedBy: UserProfile) {
    if (revokedBy.role === 'AGENT' || revokedBy.role === 'CUSTOMER') {
      throw new ForbiddenException('You cannot revoke permissions');
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
        throw new ForbiddenException(
          'You can only revoke permissions you have',
        );
      }
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
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
        action: AuditAction.PERMISSION_CHANGE,
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

  canGrantPermission(user: UserProfile, permissionLevel: number): boolean {
    const userLevel = RoleHierarchy[user.role];
    if (userLevel === 0) return true;
    if (userLevel === 1 && permissionLevel >= 1) return true;
    return false;
  }
}
