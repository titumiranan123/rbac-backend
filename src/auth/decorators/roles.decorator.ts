import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const ROLES_EXACT_KEY = 'rolesExact';

export const Roles = (...roles: RoleEnum[]) => SetMetadata(ROLES_KEY, roles);

export const RolesExact = (...roles: RoleEnum[]) => {
  return (target: any, key?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      SetMetadata(ROLES_KEY, roles)(target, key, descriptor);
      SetMetadata(ROLES_EXACT_KEY, true)(target, key, descriptor);
      return descriptor;
    } else {
      SetMetadata(ROLES_KEY, roles)(target);
      SetMetadata(ROLES_EXACT_KEY, true)(target);
      return target;
    }
  };
};