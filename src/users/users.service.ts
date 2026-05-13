import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction, RoleEnum } from '@prisma/client';
import {
  UserProfile,
  PaginatedResult,
  CreateUserData,
  UpdateUserData,
} from '../types';

const RoleHierarchy: Record<RoleEnum, number> = {
  ADMIN: 0,
  MANAGER: 1,
  AGENT: 2,
  CUSTOMER: 3,
};

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async create(
    data: CreateUserData,
    createdBy: UserProfile,
  ): Promise<UserProfile> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser)
      throw new ForbiddenException('User with this email already exists');
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || RoleEnum.CUSTOMER,
      },
    });
    await this.auditLogService.log({
      userId: createdBy.id,
      userEmail: createdBy.email,
      action: AuditAction.CREATE,
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

  async findAll(
    page = 1,
    limit = 20,
    role?: RoleEnum,
    isActive?: boolean,
  ): Promise<PaginatedResult<UserProfile>> {
    const where: { role?: RoleEnum; isActive?: boolean } = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;
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

  async findOne(id: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { permissions: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitizeUser(user);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { permissions: true },
    });
  }

  async update(
    id: string,
    updateData: UpdateUserData,
    updatedBy: UserProfile,
  ): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const oldData = { ...user };
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });
    await this.auditLogService.log({
      userId: updatedBy.id,
      userEmail: updatedBy.email,
      action: AuditAction.UPDATE,
      resource: 'user',
      resourceId: updatedUser.id,
      oldData,
      newData: updateData,
    });
    return this.sanitizeUser(updatedUser);
  }

  async remove(id: string, deletedBy: UserProfile) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.id === deletedBy.id)
      throw new ForbiddenException('Cannot delete yourself');
    const userRoleLevel = RoleHierarchy[user.role];
    const deleterRoleLevel = RoleHierarchy[deletedBy.role];
    if (deleterRoleLevel > userRoleLevel)
      throw new ForbiddenException(
        'You do not have permission to delete this user',
      );
    await this.auditLogService.log({
      userId: deletedBy.id,
      userEmail: deletedBy.email,
      action: AuditAction.DELETE,
      resource: 'user',
      resourceId: user.id,
      oldData: { email: user.email, role: user.role },
    });
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }

  async suspend(id: string, suspendedBy: UserProfile): Promise<UserProfile> {
    const targetUser = await this.prisma.user.findUnique({ where: { id } });
    if (!targetUser) throw new NotFoundException('User not found');
    if (targetUser.id === suspendedBy.id)
      throw new ForbiddenException('Cannot suspend yourself');
    const targetLevel = RoleHierarchy[targetUser.role];
    const suspenderLevel = RoleHierarchy[suspendedBy.role];
    if (suspenderLevel > targetLevel)
      throw new ForbiddenException(
        'You do not have permission to suspend this user',
      );
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    await this.auditLogService.log({
      userId: suspendedBy.id,
      userEmail: suspendedBy.email,
      action: AuditAction.SUSPEND,
      resource: 'user',
      resourceId: id,
    });
    return this.sanitizeUser(updatedUser);
  }

  async ban(id: string, bannedBy: UserProfile): Promise<UserProfile> {
    const targetUser = await this.prisma.user.findUnique({ where: { id } });
    if (!targetUser) throw new NotFoundException('User not found');
    if (targetUser.id === bannedBy.id)
      throw new ForbiddenException('Cannot ban yourself');
    const targetLevel = RoleHierarchy[targetUser.role];
    const bannerLevel = RoleHierarchy[bannedBy.role];
    if (bannerLevel > targetLevel)
      throw new ForbiddenException(
        'You do not have permission to ban this user',
      );
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    await this.auditLogService.log({
      userId: bannedBy.id,
      userEmail: bannedBy.email,
      action: AuditAction.BAN,
      resource: 'user',
      resourceId: id,
    });
    return this.sanitizeUser(updatedUser);
  }

  async activate(id: string, activatedBy: UserProfile): Promise<UserProfile> {
    const targetUser = await this.prisma.user.findUnique({ where: { id } });
    if (!targetUser) throw new NotFoundException('User not found');
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });
    await this.auditLogService.log({
      userId: activatedBy.id,
      userEmail: activatedBy.email,
      action: AuditAction.ACTIVATE,
      resource: 'user',
      resourceId: id,
    });
    return this.sanitizeUser(updatedUser);
  }

  async assignRole(
    userId: string,
    newRole: RoleEnum,
    assignedBy: UserProfile,
  ): Promise<UserProfile> {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!targetUser) throw new NotFoundException('User not found');
    const assignedByLevel = RoleHierarchy[assignedBy.role];
    const targetUserLevel = RoleHierarchy[targetUser.role];
    const newRoleLevel = RoleHierarchy[newRole];
    if (assignedByLevel > targetUserLevel)
      throw new ForbiddenException(
        "You do not have permission to change this user's role",
      );
    if (newRoleLevel < assignedByLevel)
      throw new ForbiddenException(
        'You cannot assign a role higher than your own role',
      );
    if (assignedBy.id === userId && newRole !== targetUser.role)
      throw new ForbiddenException('Cannot change your own role');
    const oldRole = targetUser.role;
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });
    await this.auditLogService.log({
      userId: assignedBy.id,
      userEmail: assignedBy.email,
      action: AuditAction.ROLE_CHANGE,
      resource: 'user',
      resourceId: targetUser.id,
      oldData: { role: oldRole },
      newData: { role: newRole },
    });
    return this.sanitizeUser(updatedUser);
  }

  async grantPermission(
    userId: string,
    permission: string,
    grantedBy: UserProfile,
  ): Promise<UserProfile> {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!targetUser) throw new NotFoundException('User not found');
    const grantedByUser = await this.prisma.user.findUnique({
      where: { id: grantedBy.id },
      include: { permissions: true },
    });
    const grantedByPermissions = grantedByUser?.grantedPermissions || [];
    const dbPermissions = grantedByUser?.permissions?.map((p) => p.name) || [];
    const allGrantedByPermissions = [
      ...grantedByPermissions,
      ...dbPermissions,
      grantedBy.role,
    ];
    if (
      !allGrantedByPermissions.includes(permission) &&
      !allGrantedByPermissions.includes('*')
    ) {
      throw new ForbiddenException(
        'You do not have permission to grant this permission',
      );
    }
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
        action: AuditAction.PERMISSION_CHANGE,
        resource: 'user',
        resourceId: targetUser.id,
        newData: { grantedPermission: permission },
      });
    }
    return this.findOne(userId);
  }

  async revokePermission(
    userId: string,
    permission: string,
    revokedBy: UserProfile,
  ): Promise<UserProfile> {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!targetUser) throw new NotFoundException('User not found');
    const revokedByUser = await this.prisma.user.findUnique({
      where: { id: revokedBy.id },
      include: { permissions: true },
    });
    const revokedByPermissions = revokedByUser?.grantedPermissions || [];
    const dbPermissions = revokedByUser?.permissions?.map((p) => p.name) || [];
    const allRevokedByPermissions = [
      ...revokedByPermissions,
      ...dbPermissions,
      revokedBy.role,
    ];
    if (
      !allRevokedByPermissions.includes(permission) &&
      !allRevokedByPermissions.includes('*')
    ) {
      throw new ForbiddenException(
        'You do not have permission to revoke this permission',
      );
    }
    const grantedPermissions = targetUser.grantedPermissions || [];
    if (grantedPermissions.includes(permission)) {
      const updated = grantedPermissions.filter(
        (p: string) => p !== permission,
      );
      await this.prisma.user.update({
        where: { id: userId },
        data: { grantedPermissions: updated },
      });
      await this.auditLogService.log({
        userId: revokedBy.id,
        userEmail: revokedBy.email,
        action: AuditAction.PERMISSION_CHANGE,
        resource: 'user',
        resourceId: targetUser.id,
        oldData: { revokedPermission: permission },
      });
    }
    return this.findOne(userId);
  }

  private sanitizeUser(user: {
    password?: string;
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: RoleEnum;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    grantedPermissions?: string[];
  }): UserProfile {
    const { password, ...result } = user;
    void password;
    return result;
  }
}
