import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { UserProfile, CreatePermissionData, UpdatePermissionData } from '../types';
export declare class PermissionsService {
    private prisma;
    private auditLogService;
    constructor(prisma: PrismaService, auditLogService: AuditLogService);
    findAll(): Promise<{
        id: string;
        name: string;
        description: string;
        resource: string;
        action: string;
        level: number;
        isActive: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        description: string;
        resource: string;
        action: string;
        level: number;
        isActive: boolean;
    }>;
    create(data: CreatePermissionData, createdBy: UserProfile): Promise<{
        id: string;
        name: string;
        description: string;
        resource: string;
        action: string;
        level: number;
        isActive: boolean;
    }>;
    update(id: string, updateData: UpdatePermissionData, updatedBy: UserProfile): Promise<{
        id: string;
        name: string;
        description: string;
        resource: string;
        action: string;
        level: number;
        isActive: boolean;
    }>;
    remove(id: string, deletedBy: UserProfile): Promise<{
        message: string;
    }>;
    canGrantPermission(user: UserProfile, permissionLevel: number): boolean;
}
