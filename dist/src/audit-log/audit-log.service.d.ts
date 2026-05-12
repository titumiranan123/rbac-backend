import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@prisma/client';
import { AuditLogInput, AuditLogResult } from '../types';
export declare class AuditLogService {
    private prisma;
    constructor(prisma: PrismaService);
    log(input: AuditLogInput): Promise<{
        id: string;
        userEmail: string;
        action: import(".prisma/client").$Enums.AuditAction;
        resource: string | null;
        resourceId: string | null;
        oldData: import("@prisma/client/runtime/client").JsonValue | null;
        newData: import("@prisma/client/runtime/client").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        status: string | null;
        timestamp: Date;
        userId: string;
    }>;
    findAll(page?: number, limit?: number, userId?: string, action?: AuditAction, startDate?: Date, endDate?: Date): Promise<AuditLogResult>;
    findByUserId(userId: string, page?: number, limit?: number): Promise<AuditLogResult>;
    findByResource(resource: string, resourceId: string): Promise<{
        id: string;
        userEmail: string;
        action: import(".prisma/client").$Enums.AuditAction;
        resource: string | null;
        resourceId: string | null;
        oldData: import("@prisma/client/runtime/client").JsonValue | null;
        newData: import("@prisma/client/runtime/client").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        status: string | null;
        timestamp: Date;
        userId: string;
    }[]>;
}
