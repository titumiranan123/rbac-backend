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

  // Creates new user with hashed password and audit log
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

  // Returns paginated users with role and status filters
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

  // Finds single user by ID with permissions included
  async findOne(id: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { permissions: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitizeUser(user);
  }

  // Finds user by email for authentication
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { permissions: true },
    });
  }

  // Updates user fields with audit trail
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

  // Deletes user with role hierarchy permission check
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

  // Changes user's role with level-based permission checks
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

  // Adds permission to user's granted permissions list
  async grantPermission(
    userId: string,
    permission: string,
    grantedBy: UserProfile,
  ): Promise<UserProfile> {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!targetUser) throw new NotFoundException('User not found');
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

  // Removes permission from user's granted permissions list
  async revokePermission(
    userId: string,
    permission: string,
    revokedBy: UserProfile,
  ): Promise<UserProfile> {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!targetUser) throw new NotFoundException('User not found');
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

  // Strips password field from user object
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
