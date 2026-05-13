import { UsersService } from './users.service';
import { RoleEnum } from '@prisma/client';
import { UserProfile, PaginatedResult, CreateUserData, UpdateUserData } from '../types';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(dto: CreateUserData, user: UserProfile): Promise<UserProfile>;
    findAll(query: {
        page?: number;
        limit?: number;
        role?: RoleEnum;
        isActive?: boolean;
    }): Promise<PaginatedResult<UserProfile>>;
    findOne(id: string): Promise<UserProfile>;
    update(id: string, dto: UpdateUserData, user: UserProfile): Promise<UserProfile>;
    remove(id: string, user: UserProfile): Promise<{
        message: string;
    }>;
    suspend(id: string, user: UserProfile): Promise<UserProfile>;
    ban(id: string, user: UserProfile): Promise<UserProfile>;
    activate(id: string, user: UserProfile): Promise<UserProfile>;
    assignRole(id: string, dto: {
        role: RoleEnum;
    }, user: UserProfile): Promise<UserProfile>;
    grantPermission(id: string, permission: string, user: UserProfile): Promise<UserProfile>;
    revokePermission(id: string, permission: string, user: UserProfile): Promise<UserProfile>;
    getUserPermissions(id: string): Promise<{
        grantedPermissions: string[];
    }>;
}
