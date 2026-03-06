import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterCourseDuration } from './master-course-duration.entity';

@Injectable()
export class MasterCourseDurationService {
    constructor(
        @InjectRepository(MasterCourseDuration)
        private readonly repo: Repository<MasterCourseDuration>,
    ) { }

    findAll() {
        return this.repo.find({ order: { courseduration: 'ASC' } });
    }

    async findOne(id: number) {
        const item = await this.repo.findOne({ where: { coursedurationid: id } as any });
        if (!item) throw new NotFoundException('Course Duration #' + id + ' not found');
        return item;
    }

    create(dto: Partial<MasterCourseDuration>) {
        return this.repo.save(this.repo.create(dto));
    }

    async update(id: number, dto: Partial<MasterCourseDuration>) {
        await this.findOne(id);
        await this.repo.update({ coursedurationid: id } as any, dto);
        return this.findOne(id);
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.repo.update({ coursedurationid: id } as any, { is_active: 'N' } as any);
        return { message: 'Course Duration #' + id + ' deactivated' };
    }
}
