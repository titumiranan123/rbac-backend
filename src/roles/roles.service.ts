import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleEnum } from '@prisma/client';
import { RoleInfo } from '../types';

const RoleHierarchy: Record<string, number> = {
  ADMIN: 0,
  MANAGER: 1,
  AGENT: 2,
  CUSTOMER: 3,
};

const FixedRoles: RoleInfo[] = [
  {
    name: RoleEnum.ADMIN,
    description: 'Full system access with all permissions',
    level: RoleHierarchy[RoleEnum.ADMIN],
    permissions: ['*'],
  },
  {
    name: RoleEnum.MANAGER,
    description: 'Can manage users and view reports',
    level: RoleHierarchy[RoleEnum.MANAGER],
    permissions: ['users:read', 'users:update', 'reports:read'],
  },
  {
    name: RoleEnum.AGENT,
    description: 'Can handle customer requests',
    level: RoleHierarchy[RoleEnum.AGENT],
    permissions: ['tickets:read', 'tickets:update', 'customers:read'],
  },
  {
    name: RoleEnum.CUSTOMER,
    description: 'Basic customer access',
    level: RoleHierarchy[RoleEnum.CUSTOMER],
    permissions: ['profile:read', 'profile:update'],
  },
];

@Injectable()
export class RolesService {
  // Returns all predefined roles
  findAll(): RoleInfo[] {
    return FixedRoles;
  }

  // Returns single role by name
  findOne(role: string): RoleInfo {
    const found = FixedRoles.find((r) => r.name === role);
    if (!found) throw new NotFoundException('Role not found');
    return found;
  }
}
