import { PermissionsService } from './permissions.service';
import { UserProfile, CreatePermissionData, UpdatePermissionData } from '../types';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
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
