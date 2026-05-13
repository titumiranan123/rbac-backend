import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@prisma/client';
import { AuditLogInput, AuditLogResult } from '../types';
export declare class AuditLogService {
    private prisma;
    constructor(prisma: PrismaService);
    log(input: AuditLogInput): Promise<{
        id: string;
        resource: string | null;
        action: import(".prisma/client").$Enums.AuditAction;
        userEmail: string;
        resourceId: string | null;
        oldData: import("@prisma/client/runtime/client").JsonValue | null;
        newData: import("@prisma/client/runtime/client").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        status: string | null;
        timestamp: Date;
        userId: string | null;
    }>;
    findAll(page?: number, limit?: number, userId?: string, action?: AuditAction, startDate?: Date, endDate?: Date): Promise<AuditLogResult>;
    findByUserId(userId: string, page?: number, limit?: number): Promise<AuditLogResult>;
    findByResource(resource: string, resourceId: string): Promise<{
        id: string;
        resource: string;
        action: import(".prisma/client").$Enums.AuditAction;
        userEmail: string;
        resourceId: string;
        oldData: import("@prisma/client/runtime/client").JsonValue;
        newData: import("@prisma/client/runtime/client").JsonValue;
        ipAddress: string;
        userAgent: string;
        status: string;
        timestamp: Date;
        userId: string;
    }[]>;
}
