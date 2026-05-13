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
            id: string;
            name: string;
            description: string;
            resource: string;
            action: string;
            level: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.RoleEnum;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        lastLoginAt: Date | null;
        grantedPermissions: string[];
    }>;
    update(id: string, updateData: UpdateUserData, updatedBy: UserProfile): Promise<UserProfile>;
    remove(id: string, deletedBy: UserProfile): Promise<{
        message: string;
    }>;
    suspend(id: string, suspendedBy: UserProfile): Promise<UserProfile>;
    ban(id: string, bannedBy: UserProfile): Promise<UserProfile>;
    activate(id: string, activatedBy: UserProfile): Promise<UserProfile>;
    assignRole(userId: string, newRole: RoleEnum, assignedBy: UserProfile): Promise<UserProfile>;
    grantPermission(userId: string, permission: string, grantedBy: UserProfile): Promise<UserProfile>;
    revokePermission(userId: string, permission: string, revokedBy: UserProfile): Promise<UserProfile>;
    private sanitizeUser;
}
