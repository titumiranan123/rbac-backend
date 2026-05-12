"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignRoleSchema = exports.UpdateUserSchema = exports.CreateUserSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.CreateUserSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    role: zod_1.z.nativeEnum(client_1.RoleEnum).optional(),
});
exports.UpdateUserSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).optional(),
    lastName: zod_1.z.string().min(1).optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.AssignRoleSchema = zod_1.z.object({
    role: zod_1.z.nativeEnum(client_1.RoleEnum),
});
//# sourceMappingURL=user.dto.js.map