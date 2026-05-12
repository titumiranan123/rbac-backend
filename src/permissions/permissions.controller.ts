import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import {
  CreatePermissionSchema,
  UpdatePermissionSchema,
} from './dto/permission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
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
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  // Seeds default permissions into database
  @Post('seed')
  @Roles(RoleEnum.ADMIN)
  async seedPermissions() {
    return this.permissionsService.seedPermissions();
  }

  // Returns all permissions ordered by resource and action
  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  async findAll() {
    return this.permissionsService.findAll();
  }

  // Returns single permission by ID
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
