import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterNsqf } from './master-nsqf.entity';

@Injectable()
export class MasterNsqfService {
    constructor(
        @InjectRepository(MasterNsqf)
        private readonly repo: Repository<MasterNsqf>,
    ) { }

    findAll() {
        return this.repo.find({ order: { nsqf_level: 'ASC' } });
    }

    async findOne(id: number) {
        const item = await this.repo.findOne({ where: { nsqfid: id } as any });
        if (!item) throw new NotFoundException('NSQF Level #' + id + ' not found');
        return item;
    }

    create(dto: Partial<MasterNsqf>) {
        return this.repo.save(this.repo.create(dto));
    }

    async update(id: number, dto: Partial<MasterNsqf>) {
        await this.findOne(id);
        await this.repo.update({ nsqfid: id } as any, dto);
        return this.findOne(id);
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.repo.update({ nsqfid: id } as any, { is_active: 'N' } as any);
        return { message: 'NSQF Level #' + id + ' deactivated' };
    }
}
