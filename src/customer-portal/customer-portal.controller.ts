import { Controller, Get, Query } from '@nestjs/common';
import { CustomerPortalService } from './customer-portal.service';
import { RolesExact } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleEnum } from '@prisma/client';
import { UserProfile, PaginatedResult } from '../types';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

@Controller('customer-portal')
export class CustomerPortalController {
  constructor(private readonly customerPortalService: CustomerPortalService) {}

  @Get('tickets')
  @RolesExact(RoleEnum.CUSTOMER)
  getTickets(
    @CurrentUser() user: UserProfile,
    @Query() query: { page?: number; limit?: number },
  ): PaginatedResult<Ticket> {
    return this.customerPortalService.getTickets(
      user.id,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  @Get('orders')
  @RolesExact(RoleEnum.CUSTOMER)
  getOrders(
    @CurrentUser() user: UserProfile,
    @Query() query: { page?: number; limit?: number },
  ): PaginatedResult<Order> {
    return this.customerPortalService.getOrders(
      user.id,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }
}
