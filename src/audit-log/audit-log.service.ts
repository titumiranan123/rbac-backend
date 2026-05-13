import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@prisma/client';
import { AuditLogInput, AuditLogResult } from '../types';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(input: AuditLogInput) {
    try {
      return await this.prisma.auditLog.create({ data: input });
    } catch (error) {
      console.error('Audit log failed:', error);
      return null;
    }
  }

  async findAll(
    page = 1,
    limit = 20,
    userId?: string,
    action?: AuditAction,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AuditLogResult> {
    const where: {
      userId?: string;
      action?: AuditAction;
      timestamp?: { gte?: Date; lte?: Date };
    } = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
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

  async findByUserId(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<AuditLogResult> {
    return this.findAll(page, limit, userId);
  }

  async findByResource(resource: string, resourceId: string) {
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
}
