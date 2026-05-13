import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import {
  CreatePermissionSchema,
  UpdatePermissionSchema,
} from './dto/permission.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleEnum } from '@prisma/client';
import {
  UserProfile,
  CreatePermissionData,
  UpdatePermissionData,
} from '../types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  // Returns permissions current user can grant (MUST be before :id route)
  @Get('grantable')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  async getGrantable(@CurrentUser() user: UserProfile) {
    console.log('Actor role:', user.role);
    console.log('Actor id:', user.id);
    return this.permissionsService.getGrantable(user);
  }

  // Grants permission to a user
  @Post('grant')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  async grant(
    @Body() dto: { userId: string; permissionName: string },
    @CurrentUser() user: UserProfile,
  ) {
    return this.permissionsService.grant(dto.userId, dto.permissionName, user);
  }

  // Revokes permission from a user
  @Post('revoke')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  async revoke(
    @Body() dto: { userId: string; permissionName: string },
    @CurrentUser() user: UserProfile,
  ) {
    return this.permissionsService.revoke(dto.userId, dto.permissionName, user);
  }

  // Returns all permissions ordered by resource and action
  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  async findAll() {
    return this.permissionsService.findAll();
  }

  // Returns single permission by ID (MUST be after specific routes)
  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  async findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  // Creates new permission with level validation
  @Post()
  @Roles(RoleEnum.ADMIN)
  async create(
    @Body(new ZodValidationPipe(CreatePermissionSchema))
    dto: CreatePermissionData,
    @CurrentUser() user: UserProfile,
  ) {
    return this.permissionsService.create(dto, user);
  }

  // Updates permission fields with audit trail
  @Put(':id')
  @Roles(RoleEnum.ADMIN)
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdatePermissionSchema))
    dto: UpdatePermissionData,
    @CurrentUser() user: UserProfile,
  ) {
    return this.permissionsService.update(id, dto, user);
  }

  // Permanently deletes a permission
  @Delete(':id')
  @Roles(RoleEnum.ADMIN)
  async remove(@Param('id') id: string, @CurrentUser() user: UserProfile) {
    return this.permissionsService.remove(id, user);
  }
}
