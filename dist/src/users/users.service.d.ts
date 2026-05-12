import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { RoleEnum } from '@prisma/client';
import { UserProfile, PaginatedResult, CreateUserData, UpdateUserData } from '../types';
export declare class UsersService {
    private prisma;
    private auditLogService;
    constructor(prisma: PrismaService, auditLogService: AuditLogService);
    create(data: CreateUserData, createdBy: UserProfile): Promise<UserProfile>;
    findAll(page?: number, limit?: number, role?: RoleEnum, isActive?: boolean): Promise<PaginatedResult<UserProfile>>;
    findOne(id: string): Promise<UserProfile>;
    findByEmail(email: string): Promise<{
        permissions: {
            level: number;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string;
            resource: string;
            action: string;
        }[];
    } & {
        id: string;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.RoleEnum;
        isActive: boolean;
        lastLoginAt: Date | null;
        grantedPermissions: string[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateData: UpdateUserData, updatedBy: UserProfile): Promise<UserProfile>;
    remove(id: string, deletedBy: UserProfile): Promise<{
        message: string;
    }>;
    assignRole(userId: string, newRole: RoleEnum, assignedBy: UserProfile): Promise<UserProfile>;
    grantPermission(userId: string, permission: string, grantedBy: UserProfile): Promise<UserProfile>;
    revokePermission(userId: string, permission: string, revokedBy: UserProfile): Promise<UserProfile>;
    private sanitizeUser;
}
