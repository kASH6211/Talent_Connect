import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../modules/users/user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        const existing = await this.userRepo.findOne({
            where: [{ username: dto.username }, { email: dto.email }],
        });
        if (existing) throw new UnauthorizedException('Username or email already taken');

        const password_hash = await bcrypt.hash(dto.password, 10);
        const user = this.userRepo.create({
            username: dto.username,
            email: dto.email,
            password_hash,
            role: dto.role || 'admin',
            created_date: new Date().toISOString(),
        });
        const saved = await this.userRepo.save(user);
        return this.signToken(saved);
    }

    async login(dto: LoginDto) {
        const user = await this.userRepo.findOne({ where: { username: dto.username } });
        if (!user || user.is_active !== 'Y')
            throw new UnauthorizedException('Invalid credentials');

        const valid = await bcrypt.compare(dto.password, user.password_hash);
        if (!valid) throw new UnauthorizedException('Invalid credentials');

        return this.signToken(user);
    }

    async validateUser(payload: { sub: number; username: string }) {
        return this.userRepo.findOne({ where: { id: payload.sub, is_active: 'Y' } });
    }

    private signToken(user: User) {
        const payload = { sub: user.id, username: user.username, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: { id: user.id, username: user.username, email: user.email, role: user.role },
        };
    }
}
