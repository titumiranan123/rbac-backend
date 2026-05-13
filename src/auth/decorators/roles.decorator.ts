import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const ROLES_EXACT_KEY = 'rolesExact';

export const Roles = (...roles: RoleEnum[]) => SetMetadata(ROLES_KEY, roles);

export const RolesExact = (...roles: RoleEnum[]) => {
  const decorator = (
    target: any,
    key?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) => {
    if (descriptor) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      Reflect.defineMetadata(ROLES_KEY, roles, descriptor.value);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      Reflect.defineMetadata(ROLES_EXACT_KEY, true, descriptor.value);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      Reflect.defineMetadata(ROLES_KEY, roles, target);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      Reflect.defineMetadata(ROLES_EXACT_KEY, true, target);
    }
    return descriptor;
  };
  return decorator;
};
