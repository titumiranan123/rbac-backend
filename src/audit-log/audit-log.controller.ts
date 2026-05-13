import { Controller, Get, Query, Param } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@prisma/client';
import { AuditLogQuery, AuditLogResult } from '../types';

@Controller('audit')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  // Returns paginated audit logs with optional filters
  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  async findAll(@Query() query: AuditLogQuery): Promise<AuditLogResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;
    return this.auditLogService.findAll(
      page,
      limit,
      query.userId,
      query.action,
      from,
      to,
    );
  }

  // Returns audit logs for specific user
  @Get('user/:userId')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  async findByUserId(
    @Param('userId') userId: string,
    @Query() query: AuditLogQuery,
  ): Promise<AuditLogResult> {
    return this.auditLogService.findByUserId(
      userId,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  // Returns audit logs for specific resource
  @Get('resource/:resource/:resourceId')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  async findByResource(
    @Param('resource') resource: string,
    @Param('resourceId') resourceId: string,
  ) {
    return this.auditLogService.findByResource(resource, resourceId);
  }
}
