import { AuditLogService } from './audit-log.service';
import { AuditLogQuery, AuditLogResult } from '../types';
export declare class AuditLogController {
    private readonly auditLogService;
    constructor(auditLogService: AuditLogService);
    findAll(query: AuditLogQuery): Promise<AuditLogResult>;
    findByUserId(userId: string, query: AuditLogQuery): Promise<AuditLogResult>;
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
