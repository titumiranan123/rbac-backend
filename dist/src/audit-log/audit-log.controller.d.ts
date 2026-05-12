import { AuditLogService } from './audit-log.service';
import { AuditLogQuery, AuditLogResult } from '../types';
export declare class AuditLogController {
    private readonly auditLogService;
    constructor(auditLogService: AuditLogService);
    findAll(query: AuditLogQuery): Promise<AuditLogResult>;
    findByUserId(userId: string, query: AuditLogQuery): Promise<AuditLogResult>;
    findByResource(resource: string, resourceId: string): Promise<{
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
        userId: string;
    }[]>;
}
