import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserSchema,
  UpdateUserSchema,
  AssignRoleSchema,
} from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleEnum } from '@prisma/client';
import {
  UserProfile,
  PaginatedResult,
  CreateUserData,
  UpdateUserData,
} from '../types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Creates a new user with hashed password
  @Post()
  @Roles(RoleEnum.ADMIN)
  async create(
    @Body(new ZodValidationPipe(CreateUserSchema)) dto: CreateUserData,
    @CurrentUser() user: UserProfile,
  ) {
    return this.usersService.create(dto, user);
  }

  // Returns paginated list of users with optional filters
  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  async findAll(
    @Query()
    query: {
      page?: number;
      limit?: number;
      role?: RoleEnum;
      isActive?: boolean;
    },
  ): Promise<PaginatedResult<UserProfile>> {
    return this.usersService.findAll(
      query.page ?? 1,
      query.limit ?? 20,
      query.role,
      query.isActive,
    );
  }

  // Returns single user by ID
  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  async findOne(@Param('id') id: string): Promise<UserProfile> {
    return this.usersService.findOne(id);
  }

  // Updates user fields with audit trail
  @Put(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateUserSchema)) dto: UpdateUserData,
    @CurrentUser() user: UserProfile,
  ) {
    return this.usersService.update(id, dto, user);
  }

  // Permanently deletes a user
  @Delete(':id')
  @Roles(RoleEnum.ADMIN)
  async remove(@Param('id') id: string, @CurrentUser() user: UserProfile) {
    return this.usersService.remove(id, user);
  }

  // Changes target user's role with hierarchy checks
  @Post(':id/role')
  @Roles(RoleEnum.ADMIN)
  async assignRole(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(AssignRoleSchema)) dto: { role: RoleEnum },
    @CurrentUser() user: UserProfile,
  ): Promise<UserProfile> {
    return this.usersService.assignRole(id, dto.role, user);
  }

  // Grants a permission to target user
  @Post(':id/permissions/:permission')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  async grantPermission(
    @Param('id') id: string,
    @Param('permission') permission: string,
    @CurrentUser() user: UserProfile,
  ): Promise<UserProfile> {
    return this.usersService.grantPermission(id, permission, user);
  }

  // Revokes a permission from target user
  @Delete(':id/permissions/:permission')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  async revokePermission(
    @Param('id') id: string,
    @Param('permission') permission: string,
    @CurrentUser() user: UserProfile,
  ): Promise<UserProfile> {
    return this.usersService.revokePermission(id, permission, user);
  }
}
