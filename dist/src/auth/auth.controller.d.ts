import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { UserProfile } from '../types';
interface Cookies {
    refreshToken?: string;
}
interface AuthRequest extends Request {
    cookies: Cookies;
    user?: {
        id: string;
        email: string;
        role: string;
    };
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }, req: Request, res: Response): Promise<{
        accessToken: string;
        user: UserProfile;
    }>;
    login(dto: {
        email: string;
        password: string;
    }, req: Request, res: Response): Promise<{
        accessToken: string;
        user: UserProfile;
    }>;
    refresh(req: AuthRequest, res: Response): Promise<{
        accessToken: string;
        user: UserProfile;
    }>;
    logout(user: UserProfile, req: AuthRequest, res: Response): Promise<{
        message: string;
    }>;
    me(user: UserProfile): UserProfile;
    private setRefreshTokenCookie;
    private clearRefreshTokenCookie;
}
export {};
