import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    async canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) return true;

        const canActivate = await super.canActivate(context);
        if (!canActivate) return false;

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // If password hasn't been changed, only allow access to the password change endpoint
        // Skip check for industry role as requested
        if (user && user.is_passwordchanged === 'N' && user.role !== 'industry') {
            const url = request.url;
            // The endpoint is /api/auth/change-password, but request.url in Nest might vary based on prefix
            // Typically it's the full URL or relative to the prefix. 
            // Since app.setGlobalPrefix('api') is used, and the route is 'auth/change-password'
            if (!url.includes('auth/change-password')) {
                const { UnauthorizedException } = require('@nestjs/common');
                throw new UnauthorizedException('Password change required before accessing this resource');
            }
        }

        return true;
    }
}
