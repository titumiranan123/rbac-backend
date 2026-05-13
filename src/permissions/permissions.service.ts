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

  canGrantPermission(user: UserProfile, permissionLevel: number): boolean {
    const userLevel = RoleHierarchy[user.role];
    if (userLevel === 0) return true;
    if (userLevel === 1 && permissionLevel >= 1) return true;
    return false;
  }
}
