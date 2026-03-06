import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterSession } from './master-session.entity';

@Injectable()
export class MasterSessionService {
    constructor(
        @InjectRepository(MasterSession)
        private readonly repo: Repository<MasterSession>,
    ) { }

    findAll() {
        return this.repo.find({ order: { session: 'DESC' } });
    }

    async findOne(id: number) {
        const item = await this.repo.findOne({ where: { sessionid: id } as any });
        if (!item) throw new NotFoundException('Session #' + id + ' not found');
        return item;
    }

    create(dto: Partial<MasterSession>) {
        return this.repo.save(this.repo.create(dto));
    }

    async update(id: number, dto: Partial<MasterSession>) {
        await this.findOne(id);
        await this.repo.update({ sessionid: id } as any, dto);
        return this.findOne(id);
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.repo.update({ sessionid: id } as any, { is_active: 'N' } as any);
        return { message: 'Session #' + id + ' deactivated' };
    }
}
