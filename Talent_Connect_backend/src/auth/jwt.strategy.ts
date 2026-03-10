import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'talent_connect_secret_key_2024',
        });
    }

    async validate(payload: { sub: number; username: string; role: string }) {
        console.log('[JwtStrategy] Validating Payload:', JSON.stringify(payload));
        const user = await this.authService.validateUser(payload);
        if (!user) {
            console.warn('[JwtStrategy] User not found or inactive for sub:', payload.sub);
        }
        return user;
    }
}
