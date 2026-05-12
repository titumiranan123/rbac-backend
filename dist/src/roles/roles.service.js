"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const RoleHierarchy = {
    ADMIN: 0,
    MANAGER: 1,
    AGENT: 2,
    CUSTOMER: 3,
};
const FixedRoles = [
    {
        name: client_1.RoleEnum.ADMIN,
        description: 'Full system access with all permissions',
        level: RoleHierarchy[client_1.RoleEnum.ADMIN],
        permissions: ['*'],
    },
    {
        name: client_1.RoleEnum.MANAGER,
        description: 'Can manage users and view reports',
        level: RoleHierarchy[client_1.RoleEnum.MANAGER],
        permissions: ['users:read', 'users:update', 'reports:read'],
    },
    {
        name: client_1.RoleEnum.AGENT,
        description: 'Can handle customer requests',
        level: RoleHierarchy[client_1.RoleEnum.AGENT],
        permissions: ['tickets:read', 'tickets:update', 'customers:read'],
    },
    {
        name: client_1.RoleEnum.CUSTOMER,
        description: 'Basic customer access',
        level: RoleHierarchy[client_1.RoleEnum.CUSTOMER],
        permissions: ['profile:read', 'profile:update'],
    },
];
let RolesService = class RolesService {
    findAll() {
        return FixedRoles;
    }
    findOne(role) {
        const found = FixedRoles.find((r) => r.name === role);
        if (!found)
            throw new common_1.NotFoundException('Role not found');
        return found;
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)()
], RolesService);
//# sourceMappingURL=roles.service.js.map