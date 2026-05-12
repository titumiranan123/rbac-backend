import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import {
  RegisterSchema,
  LoginSchema,
  RefreshTokenSchema,
} from './dto/auth.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserProfile } from '../types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Registers a new user with email, password and basic info
  @Public()
  @Post('register')
  async register(
    @Body(new ZodValidationPipe(RegisterSchema))
    dto: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    },
    @Req() req: Request,
  ) {
    return this.authService.register(dto, req.ip, req.headers['user-agent']);
  }

  // Validates user credentials and returns access and refresh tokens
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(LoginSchema))
    dto: { email: string; password: string },
    @Req() req: Request,
  ) {
    return this.authService.login(dto, req.ip, req.headers['user-agent']);
  }

  // Issues new access token using valid refresh token
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body(new ZodValidationPipe(RefreshTokenSchema))
    dto: {
      refreshToken: string;
    },
  ) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  // Logs out user by invalidating their session
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: UserProfile, @Req() req: Request) {
    return this.authService.logout(user, req.ip, req.headers['user-agent']);
  }

  // Returns current authenticated user profile
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  me(@CurrentUser() user: UserProfile): UserProfile {
    return user;
  }
}
