import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query, Res, All } from '@nestjs/common';
// Removed invalid import of frontend helper
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ChangePasswordDto } from './dto/auth.dto';
import { SSOCallbackDto } from './dto/sso-callback.dto';
import { Public } from './public.decorator';
import type { Request } from 'express';
import { Req } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('register')
    @ApiOperation({ summary: 'Register a new admin user' })
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login and receive JWT token' })
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('change-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Change user password' })
    changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
        return this.authService.changePassword(req.user.id, dto.oldPassword, dto.newPassword);
    }

    @Public()
    @All('sso/callback')
    @ApiOperation({ summary: 'Handle FastTrack SSO Callback' })
    async ssoCallback(@Query() query: SSOCallbackDto, @Body() body: any, @Res() res: any, @Req() req: Request) {
        const logFilePath = path.join(process.cwd(), 'sso_debug.log');
        const timestamp = new Date().toISOString();
        const method = req.method;
        const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

        const logData = `--- SSO Callback [${method}] at ${timestamp} ---\n` +
            `Full URL: ${fullUrl}\n` +
            `Raw Query: ${JSON.stringify(req.query)}\n` +
            `Raw Body: ${JSON.stringify(req.body)}\n` +
            `DTO Query: ${JSON.stringify(query)}\n` +
            `Headers: ${JSON.stringify(req.headers)}\n\n`;

        try {
            fs.appendFileSync(logFilePath, logData);
        } catch (e) {
            console.error('Failed to write to sso_debug.log', e);
        }

        console.log(`[SSO Callback] ${method} request received. Check sso_debug.log for details.`);

        // Support multiple parameter names (msg, ssotoken, ssoToken, etc.) from both query and body
        const combined = { ...req.query, ...req.body, ...query };
        const tokenPayload = combined.msg || combined.ssotoken || combined.ssoToken || combined.token || combined.SsoToken;

        if (!tokenPayload) {
            console.warn(`[SSO Callback] Missing payload in ${method} request.`);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4000';
            return res.redirect(`${frontendUrl}/login?error=Missing+SSO+Payload`);
        }

        try {
            const result = await this.authService.handleSSOCallback(tokenPayload);

            // Redirect to appropriate dashboard based on role
            const role = result.user.role;
            let dashboardPath = '/';
            if (role === 'industry') {
                dashboardPath = '/find-institutes';
            } else if (role === 'institute') {
                dashboardPath = '/institute/dashboard';
            } else if (role === 'superadmin') {
                dashboardPath = '/admin/dashboard';
            }
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4000';
            const redirectUrl = new URL(`${frontendUrl}${dashboardPath}`);
            redirectUrl.searchParams.set('token', result.access_token);

            console.log(`[SSO Callback] Redirecting to: ${redirectUrl.toString()}`);
            return res.redirect(redirectUrl.toString());
        } catch (error) {
            console.error('SSO Callback Error:', error);
            const errorLog = `--- SSO Callback Error at ${new Date().toISOString()} ---\n${error.stack}\n\n`;
            fs.appendFileSync(logFilePath, errorLog);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4000';
            return res.redirect(`${frontendUrl}/login?error=SSO+Failed`);
        }
    }
}
