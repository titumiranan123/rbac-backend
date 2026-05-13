import { RoleEnum } from '@prisma/client';
export declare const ROLES_KEY = "roles";
export declare const ROLES_EXACT_KEY = "rolesExact";
export declare const Roles: (...roles: RoleEnum[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const RolesExact: (...roles: RoleEnum[]) => (target: any, key?: string | symbol, descriptor?: PropertyDescriptor) => any;
