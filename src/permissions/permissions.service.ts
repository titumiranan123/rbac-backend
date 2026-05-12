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

interface PermissionData {
  name: string;
  description: string;
  resource: string;
  action: string;
  level: number;
}

@Injectable()
export class PermissionsService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  // Creates default permissions if they don't exist
  async seedPermissions() {
    const permissions: PermissionData[] = [
      {
        name: 'users:create',
        description: 'Create users',
        resource: 'users',
        action: 'create',
        level: 0,
      },
      {
        name: 'users:read',
        description: 'Read users',
        resource: 'users',
        action: 'read',
        level: 0,
      },
      {
        name: 'users:update',
        description: 'Update users',
        resource: 'users',
        action: 'update',
        level: 0,
      },
      {
        name: 'users:delete',
        description: 'Delete users',
        resource: 'users',
        action: 'delete',
        level: 0,
      },
      {
        name: 'roles:create',
        description: 'Create roles',
        resource: 'roles',
        action: 'create',
        level: 0,
      },
      {
        name: 'roles:read',
        description: 'Read roles',
        resource: 'roles',
        action: 'read',
        level: 0,
      },
      {
        name: 'roles:update',
        description: 'Update roles',
        resource: 'roles',
        action: 'update',
        level: 0,
      },
      {
        name: 'roles:delete',
        description: 'Delete roles',
        resource: 'roles',
        action: 'delete',
        level: 0,
      },
      {
        name: 'permissions:manage',
        description: 'Manage permissions',
        resource: 'permissions',
        action: 'manage',
        level: 0,
      },
      {
        name: 'audit:read',
        description: 'Read audit logs',
        resource: 'audit',
        action: 'read',
        level: 1,
      },
      {
        name: 'reports:read',
        description: 'Read reports',
        resource: 'reports',
        action: 'read',
        level: 1,
      },
      {
        name: 'tickets:create',
        description: 'Create tickets',
        resource: 'tickets',
        action: 'create',
        level: 2,
      },
      {
        name: 'tickets:read',
        description: 'Read tickets',
        resource: 'tickets',
        action: 'read',
        level: 2,
      },
      {
        name: 'tickets:update',
        description: 'Update tickets',
        resource: 'tickets',
        action: 'update',
        level: 2,
      },
      {
        name: 'customers:read',
        description: 'Read customers',
        resource: 'customers',
        action: 'read',
        level: 2,
      },
      {
        name: 'profile:read',
        description: 'Read own profile',
        resource: 'profile',
        action: 'read',
        level: 3,
      },
      {
        name: 'profile:update',
        description: 'Update own profile',
        resource: 'profile',
        action: 'update',
        level: 3,
      },
    ];
    for (const permData of permissions) {
      const existingPerm = await this.prisma.permission.findUnique({
        where: { name: permData.name },
      });
      if (!existingPerm)
        await this.prisma.permission.create({ data: permData });
    }
    return { message: 'Permissions seeded successfully' };
  }

  // Returns all permissions ordered by resource and action
  async findAll() {
    return this.prisma.permission.findMany({
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });
  }

  // Finds single permission by ID
  async findOne(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });
    if (!permission) throw new NotFoundException('Permission not found');
    return permission;
  }

  // Creates permission with role level validation
  async create(data: CreatePermissionData, createdBy: UserProfile) {
    const userLevel = RoleHierarchy[createdBy.role];
    if (userLevel > 0)
      throw new ForbiddenException('Only Admin can create permissions');
    if (data.level < userLevel)
      throw new ForbiddenException(
        'Cannot create permission with level higher than your role',
      );
    const permission = await this.prisma.permission.create({ data });
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

  // Updates permission with level validation and audit
  async update(
    id: string,
    updateData: UpdatePermissionData,
    updatedBy: UserProfile,
  ) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });
    if (!permission) throw new NotFoundException('Permission not found');
    const userLevel = RoleHierarchy[updatedBy.role];
    if (userLevel > 0)
      throw new ForbiddenException('Only Admin can update permissions');
    if (updateData.level !== undefined && updateData.level < userLevel)
      throw new ForbiddenException(
        'Cannot set permission level higher than your role',
      );
    const oldData = { ...permission };
    const updatedPermission = await this.prisma.permission.update({
      where: { id },
      data: updateData,
    });
    await this.auditLogService.log({
      userId: updatedBy.id,
      userEmail: updatedBy.email,
      action: AuditAction.UPDATE,
      resource: 'permission',
      resourceId: updatedPermission.id,
      oldData,
      newData: updateData,
    });
    return updatedPermission;
  }

  // Deletes permission with role level check
  async remove(id: string, deletedBy: UserProfile) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
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

  // Checks if user can grant permission at given level
  canGrantPermission(user: UserProfile, permissionLevel: number): boolean {
    const userLevel = RoleHierarchy[user.role];
    if (userLevel === 0) return true;
    if (userLevel === 1 && permissionLevel >= 1) return true;
    return false;
  }
}
