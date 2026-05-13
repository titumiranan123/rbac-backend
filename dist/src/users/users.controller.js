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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const user_dto_1 = require("./dto/user.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const zod_validation_pipe_1 = require("../common/pipes/zod-validation.pipe");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async create(dto, user) {
        return this.usersService.create(dto, user);
    }
    async findAll(query) {
        return this.usersService.findAll(query.page ?? 1, query.limit ?? 20, query.role, query.isActive);
    }
    async findOne(id) {
        return this.usersService.findOne(id);
    }
    async update(id, dto, user) {
        return this.usersService.update(id, dto, user);
    }
    async remove(id, user) {
        return this.usersService.remove(id, user);
    }
    async suspend(id, user) {
        return this.usersService.suspend(id, user);
    }
    async ban(id, user) {
        return this.usersService.ban(id, user);
    }
    async activate(id, user) {
        return this.usersService.activate(id, user);
    }
    async assignRole(id, dto, user) {
        return this.usersService.assignRole(id, dto.role, user);
    }
    async grantPermission(id, permission, user) {
        return this.usersService.grantPermission(id, permission, user);
    }
    async revokePermission(id, permission, user) {
        return this.usersService.revokePermission(id, permission, user);
    }
    async getUserPermissions(id) {
        const user = await this.usersService.findOne(id);
        return { grantedPermissions: user.grantedPermissions || [] };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.RoleEnum.ADMIN),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(user_dto_1.CreateUserSchema))),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.RoleEnum.ADMIN, client_1.RoleEnum.MANAGER),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.RoleEnum.ADMIN, client_1.RoleEnum.MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(client_1.RoleEnum.ADMIN, client_1.RoleEnum.MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(user_dto_1.UpdateUserSchema))),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.RoleEnum.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/suspend'),
    (0, roles_decorator_1.Roles)(client_1.RoleEnum.ADMIN, client_1.RoleEnum.MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "suspend", null);
__decorate([
    (0, common_1.Patch)(':id/ban'),
    (0, roles_decorator_1.Roles)(client_1.RoleEnum.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "ban", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    (0, roles_decorator_1.Roles)(client_1.RoleEnum.ADMIN, client_1.RoleEnum.MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "activate", null);
__decorate([
    (0, common_1.Post)(':id/role'),
    (0, roles_decorator_1.Roles)(client_1.RoleEnum.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(user_dto_1.AssignRoleSchema))),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "assignRole", null);
__decorate([
    (0, common_1.Post)(':id/permissions/:permission'),
    (0, roles_decorator_1.Roles)(client_1.RoleEnum.ADMIN, client_1.RoleEnum.MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('permission')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "grantPermission", null);
__decorate([
    (0, common_1.Delete)(':id/permissions/:permission'),
    (0, roles_decorator_1.Roles)(client_1.RoleEnum.ADMIN, client_1.RoleEnum.MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('permission')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "revokePermission", null);
__decorate([
    (0, common_1.Get)('permissions/user/:id'),
    (0, roles_decorator_1.Roles)(client_1.RoleEnum.ADMIN, client_1.RoleEnum.MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserPermissions", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map