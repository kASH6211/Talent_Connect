import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) { }

    async findAll(): Promise<User[]> {
        // Return users but exclude sensitive data (password_hash)
        const users = await this.userRepo.find({
            select: ['id', 'username', 'email', 'role', 'is_active', 'created_date', 'institute_id', 'industry_id'],
            order: { id: 'ASC' }
        });
        return users;
    }
}
