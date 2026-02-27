import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstituteQualificationMapping } from './institute-qualification-mapping.entity';

@Injectable()
export class InstituteQualificationMappingService {
    constructor(
        @InjectRepository(InstituteQualificationMapping)
        private readonly repo: Repository<InstituteQualificationMapping>,
    ) { }

    findAll(user?: any) {
        const where: any = {};
        if (user?.role === 'institute' && user?.institute_id) {
            where.instituteId = user.institute_id;
        }
        return this.repo.find({ where, relations: ['institute', 'qualification', 'streamBranch'] });
    }

    async findOne(id: number) {
        const item = await this.repo.findOne({
            where: { institute_qualification_id: id } as any,
            relations: ['institute', 'qualification', 'streamBranch'],
        });
        if (!item) throw new NotFoundException('InstituteQualificationMapping #' + id + ' not found');
        return item;
    }

    create(dto: Partial<InstituteQualificationMapping>, user?: any) {
        if (user?.role === 'institute' && user?.institute_id) {
            dto.instituteId = user.institute_id;
        }
        return this.repo.save(this.repo.create(dto));
    }

    async update(id: number, dto: Partial<InstituteQualificationMapping>, user?: any) {
        const item = await this.findOne(id);
        if (user?.role === 'institute' && user?.institute_id && item.instituteId !== user.institute_id) {
            throw new NotFoundException('Not authorized to update this mapping');
        }
        await this.repo.update({ institute_qualification_id: id } as any, dto);
        return this.findOne(id);
    }

    async remove(id: number, user?: any) {
        const item = await this.findOne(id);
        if (user?.role === 'institute' && user?.institute_id && item.instituteId !== user.institute_id) {
            throw new NotFoundException('Not authorized to update this mapping');
        }
        await this.repo.update({ institute_qualification_id: id } as any, { is_active: 'N' } as any);
        return { message: 'InstituteQualificationMapping #' + id + ' deactivated' };
    }
}
