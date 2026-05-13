import { PermissionsService } from './permissions.service';
import { UserProfile, CreatePermissionData, UpdatePermissionData } from '../types';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    getGrantable(user: UserProfile): Promise<{
        id: string;
        name: string;
        description: string;
        resource: string;
        action: string;
        level: number;
        isActive: boolean;
    }[]>;
    grant(dto: {
        userId: string;
        permissionName: string;
    }, user: UserProfile): Promise<{
        id: string;
        isActive: boolean;
        role: import(".prisma/client").$Enums.RoleEnum;
        email: string;
        firstName: string;
        lastName: string;
        grantedPermissions: string[];
    }>;
    revoke(dto: {
        userId: string;
        permissionName: string;
    }, user: UserProfile): Promise<{
        id: string;
        isActive: boolean;
        role: import(".prisma/client").$Enums.RoleEnum;
        email: string;
        firstName: string;
        lastName: string;
        grantedPermissions: string[];
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        description: string;
        resource: string;
        action: string;
        level: number;
        isActive: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        description: string;
        resource: string;
        action: string;
        level: number;
        isActive: boolean;
    }>;
    create(dto: CreatePermissionData, user: UserProfile): Promise<{
        id: string;
        name: string;
        description: string;
        resource: string;
        action: string;
        level: number;
        isActive: boolean;
    }>;
    update(id: string, dto: UpdatePermissionData, user: UserProfile): Promise<{
        id: string;
        name: string;
        description: string;
        resource: string;
        action: string;
        level: number;
        isActive: boolean;
    }>;
    remove(id: string, user: UserProfile): Promise<{
        message: string;
    }>;
}
