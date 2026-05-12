import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@prisma/client';
import { RoleInfo } from '../types';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // Returns all available roles
  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  findAll(): RoleInfo[] {
    return this.rolesService.findAll();
  }

  // Returns single role by name
  @Get(':role')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  findOne(@Param('role') role: string): RoleInfo {
    return this.rolesService.findOne(role);
  }
}
