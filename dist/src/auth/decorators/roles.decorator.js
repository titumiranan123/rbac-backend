"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesExact = exports.Roles = exports.ROLES_EXACT_KEY = exports.ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ROLES_KEY = 'roles';
exports.ROLES_EXACT_KEY = 'rolesExact';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
const RolesExact = (...roles) => {
    return (target, key, descriptor) => {
        if (descriptor) {
            (0, common_1.SetMetadata)(exports.ROLES_KEY, roles)(target, key, descriptor);
            (0, common_1.SetMetadata)(exports.ROLES_EXACT_KEY, true)(target, key, descriptor);
            return descriptor;
        }
        else {
            (0, common_1.SetMetadata)(exports.ROLES_KEY, roles)(target);
            (0, common_1.SetMetadata)(exports.ROLES_EXACT_KEY, true)(target);
            return target;
        }
    };
};
exports.RolesExact = RolesExact;
//# sourceMappingURL=roles.decorator.js.map