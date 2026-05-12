import { RolesService } from './roles.service';
import { RoleInfo } from '../types';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    findAll(): RoleInfo[];
    findOne(role: string): RoleInfo;
}
