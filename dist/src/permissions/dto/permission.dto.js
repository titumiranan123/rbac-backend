"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePermissionSchema = exports.CreatePermissionSchema = void 0;
const zod_1 = require("zod");
exports.CreatePermissionSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    resource: zod_1.z.string().min(1, 'Resource is required'),
    action: zod_1.z.string().min(1, 'Action is required'),
    level: zod_1.z.number().int().min(0).max(3),
});
exports.UpdatePermissionSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().min(1).optional(),
    resource: zod_1.z.string().min(1).optional(),
    action: zod_1.z.string().min(1).optional(),
    level: zod_1.z.number().int().min(0).max(3).optional(),
    isActive: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=permission.dto.js.map