import { RoleInfo } from '../types';
export declare class RolesService {
    findAll(): RoleInfo[];
    findOne(role: string): RoleInfo;
}
