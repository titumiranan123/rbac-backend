import { PermissionsService } from './permissions.service';
import { UserProfile, CreatePermissionData, UpdatePermissionData } from '../types';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    seedPermissions(): Promise<{
        message: string;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        description: string;
        resource: string;
        action: string;
        level: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        description: string;
        resource: string;
        action: string;
        level: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreatePermissionData, user: UserProfile): Promise<{
        id: string;
        name: string;
        description: string;
        resource: string;
        action: string;
        level: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdatePermissionData, user: UserProfile): Promise<{
        id: string;
        name: string;
        description: string;
        resource: string;
        action: string;
        level: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, user: UserProfile): Promise<{
        message: string;
    }>;
}
