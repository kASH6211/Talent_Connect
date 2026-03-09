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

    async findAll(query?: any) {
        const page = Number(query?.page) || 1;
        const limit = Number(query?.limit) || 10;
        const skip = (page - 1) * limit;
        const search = query?.search;

        const qb = this.repo.createQueryBuilder('m')
            .leftJoinAndSelect('m.institute', 'institute')
            .leftJoinAndSelect('m.qualification', 'qualification')
            .leftJoinAndSelect('m.streamBranch', 'streamBranch')
            .leftJoinAndSelect('streamBranch.affiliation', 'affiliation')
            .leftJoinAndSelect('streamBranch.nsqf', 'nsqf')
            .leftJoinAndSelect('streamBranch.courseDuration', 'courseDuration')
            .where('m.is_active = :active', { active: 'Y' });

        if (query?.role === 'institute' && query?.institute_id) {
            qb.andWhere('m.instituteId = :instituteId', { instituteId: query.institute_id });
        } else if (query?.institute_id) {
            qb.andWhere('m.instituteId = :instituteId', { instituteId: query.institute_id });
        }

        if (search) {
            qb.andWhere(
                '(LOWER(institute.institute_name) LIKE LOWER(:search) OR LOWER(qualification.qualification) LIKE LOWER(:search) OR LOWER(streamBranch.stream_branch_name) LIKE LOWER(:search))',
                { search: `%${search}%` }
            );
        }

        const [data, total] = await qb
            .orderBy('qualification.qualification', 'ASC')
            .addOrderBy('institute.institute_name', 'ASC')
            .addOrderBy('streamBranch.stream_branch_name', 'ASC')
            .addOrderBy('affiliation.affiliating_body', 'ASC')
            .addOrderBy('courseDuration.courseduration', 'ASC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return { data, total, page, limit };
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
