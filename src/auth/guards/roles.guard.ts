import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from '@prisma/client';
import { UserProfile } from '../../types';

const RoleHierarchy: Record<RoleEnum, number> = {
  ADMIN: 0,
  MANAGER: 1,
  AGENT: 2,
  CUSTOMER: 3,
};

interface RequestWithUser {
  user?: UserProfile;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );
    const exactMatch = this.reflector.getAllAndOverride<boolean>(
      'rolesExact',
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) return true;
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    if (!user) return false;
    const userLevel = RoleHierarchy[user.role];
    if (exactMatch) {
      return requiredRoles.some((role) => user.role === role);
    }
    return requiredRoles.some((role) => userLevel <= RoleHierarchy[role]);
  }
}