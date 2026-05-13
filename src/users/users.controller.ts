import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserSchema, UpdateUserSchema, AssignRoleSchema } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleEnum } from '@prisma/client';
import { UserProfile, PaginatedResult, CreateUserData, UpdateUserData } from '../types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  async create(@Body(new ZodValidationPipe(CreateUserSchema)) dto: CreateUserData, @CurrentUser() user: UserProfile) {
    return this.usersService.create(dto, user);
  }

  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  async findAll(@Query() query: { page?: number; limit?: number; role?: RoleEnum; isActive?: boolean }): Promise<PaginatedResult<UserProfile>> {
    return this.usersService.findAll(query.page ?? 1, query.limit ?? 20, query.role, query.isActive);
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  async findOne(@Param('id') id: string): Promise<UserProfile> {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  async update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateUserSchema)) dto: UpdateUserData, @CurrentUser() user: UserProfile) {
    return this.usersService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN)
  async remove(@Param('id') id: string, @CurrentUser() user: UserProfile) {
    return this.usersService.remove(id, user);
  }

  @Patch(':id/suspend')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  async suspend(@Param('id') id: string, @CurrentUser() user: UserProfile): Promise<UserProfile> {
    return this.usersService.suspend(id, user);
  }

  @Patch(':id/ban')
  @Roles(RoleEnum.ADMIN)
  async ban(@Param('id') id: string, @CurrentUser() user: UserProfile): Promise<UserProfile> {
    return this.usersService.ban(id, user);
  }

  @Patch(':id/activate')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  async activate(@Param('id') id: string, @CurrentUser() user: UserProfile): Promise<UserProfile> {
    return this.usersService.activate(id, user);
  }

  @Post(':id/role')
  @Roles(RoleEnum.ADMIN)
  async assignRole(@Param('id') id: string, @Body(new ZodValidationPipe(AssignRoleSchema)) dto: { role: RoleEnum }, @CurrentUser() user: UserProfile): Promise<UserProfile> {
    return this.usersService.assignRole(id, dto.role, user);
  }

  @Post(':id/permissions/:permission')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  async grantPermission(@Param('id') id: string, @Param('permission') permission: string, @CurrentUser() user: UserProfile): Promise<UserProfile> {
    return this.usersService.grantPermission(id, permission, user);
  }

  @Delete(':id/permissions/:permission')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  async revokePermission(@Param('id') id: string, @Param('permission') permission: string, @CurrentUser() user: UserProfile): Promise<UserProfile> {
    return this.usersService.revokePermission(id, permission, user);
  }
}