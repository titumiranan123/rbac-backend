import { Request } from 'express';
import { AuthService } from './auth.service';
import { UserProfile } from '../types';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }, req: Request): Promise<import("../types").AuthTokens>;
    login(dto: {
        email: string;
        password: string;
    }, req: Request): Promise<import("../types").AuthTokens>;
    refresh(dto: {
        refreshToken: string;
    }): Promise<import("../types").AuthTokens>;
    logout(user: UserProfile, req: Request): Promise<{
        message: string;
    }>;
    me(user: UserProfile): UserProfile;
}
