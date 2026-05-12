import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { UserProfile, CreatePermissionData, UpdatePermissionData } from '../types';
export declare class PermissionsService {
    private prisma;
    private auditLogService;
    constructor(prisma: PrismaService, auditLogService: AuditLogService);
    seedPermissions(): Promise<{
        message: string;
    }>;
    findAll(): Promise<{
        level: number;
        id: string;
        name: string;
        description: string;
        resource: string;
        action: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        level: number;
        id: string;
        name: string;
        description: string;
        resource: string;
        action: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(data: CreatePermissionData, createdBy: UserProfile): Promise<{
        level: number;
        id: string;
        name: string;
        description: string;
        resource: string;
        action: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateData: UpdatePermissionData, updatedBy: UserProfile): Promise<{
        level: number;
        id: string;
        name: string;
        description: string;
        resource: string;
        action: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, deletedBy: UserProfile): Promise<{
        message: string;
    }>;
    canGrantPermission(user: UserProfile, permissionLevel: number): boolean;
}
