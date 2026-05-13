"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesExact = exports.Roles = exports.ROLES_EXACT_KEY = exports.ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ROLES_KEY = 'roles';
exports.ROLES_EXACT_KEY = 'rolesExact';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
const RolesExact = (...roles) => {
    const decorator = (target, key, descriptor) => {
        if (descriptor) {
            Reflect.defineMetadata(exports.ROLES_KEY, roles, descriptor.value);
            Reflect.defineMetadata(exports.ROLES_EXACT_KEY, true, descriptor.value);
        }
        else {
            Reflect.defineMetadata(exports.ROLES_KEY, roles, target);
            Reflect.defineMetadata(exports.ROLES_EXACT_KEY, true, target);
        }
        return descriptor;
    };
    return decorator;
};
exports.RolesExact = RolesExact;
//# sourceMappingURL=roles.decorator.js.map