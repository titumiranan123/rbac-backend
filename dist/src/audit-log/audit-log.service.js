"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AuditLogService = class AuditLogService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(input) {
        try {
            return await this.prisma.auditLog.create({ data: input });
        }
        catch (error) {
            console.error('Audit log failed:', error);
            return null;
        }
    }
    async findAll(page = 1, limit = 20, userId, action, startDate, endDate) {
        const where = {};
        if (userId)
            where.userId = userId;
        if (action)
            where.action = action;
        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate)
                where.timestamp.gte = startDate;
            if (endDate)
                where.timestamp.lte = endDate;
        }
        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                select: {
                    id: true,
                    userId: true,
                    userEmail: true,
                    action: true,
                    resource: true,
                    resourceId: true,
                    oldData: true,
                    newData: true,
                    ipAddress: true,
                    userAgent: true,
                    status: true,
                    timestamp: true,
                },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { timestamp: 'desc' },
            }),
            this.prisma.auditLog.count({ where }),
        ]);
        return {
            data: logs,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(Number(total) / limit),
            },
        };
    }
    async findByUserId(userId, page = 1, limit = 20) {
        return this.findAll(page, limit, userId);
    }
    async findByResource(resource, resourceId) {
        return this.prisma.auditLog.findMany({
            where: { resource, resourceId },
            select: {
                id: true,
                userId: true,
                userEmail: true,
                action: true,
                resource: true,
                resourceId: true,
                oldData: true,
                newData: true,
                ipAddress: true,
                userAgent: true,
                status: true,
                timestamp: true,
            },
            orderBy: { timestamp: 'desc' },
        });
    }
};
exports.AuditLogService = AuditLogService;
exports.AuditLogService = AuditLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditLogService);
//# sourceMappingURL=audit-log.service.js.map