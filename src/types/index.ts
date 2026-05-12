import { AuditAction, RoleEnum, User, Prisma } from '@prisma/client';

export type JsonValue = Prisma.InputJsonValue;

export interface AuditLogInput {
  userId: string;
  userEmail: string;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  oldData?: JsonValue;
  newData?: JsonValue;
  ipAddress?: string;
  userAgent?: string;
  status?: string;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: RoleEnum;
}
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface UserProfile {
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
}

export interface UserWithPermissions extends User {
  permissions: {
    id: string;
    name: string;
    resource: string;
    action: string;
    level: number;
  }[];
}

export interface AuditLogQuery {
  page?: number;
  limit?: number;
  userId?: string;
  action?: AuditAction;
  from?: string;
  to?: string;
}

export interface AuditLogResult {
  data: {
    id: string;
    userId: string;
    userEmail: string;
    action: AuditAction;
    resource: string | null;
    resourceId: string | null;
    oldData: JsonValue | null;
    newData: JsonValue | null;
    ipAddress: string | null;
    userAgent: string | null;
    status: string | null;
    timestamp: Date;
  }[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface PaginatedResult<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export type CreateUserData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: RoleEnum;
};
export type UpdateUserData = {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
};
export type CreatePermissionData = {
  name: string;
  description: string;
  resource: string;
  action: string;
  level: number;
};
export type UpdatePermissionData = Partial<CreatePermissionData> & {
  isActive?: boolean;
};

export interface RoleInfo {
  name: RoleEnum;
  description: string;
  level: number;
  permissions: string[];
}
