import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StreamBranchQualificationMapping } from './stream-branch-qualification-mapping.entity';

@Injectable()
export class StreamBranchQualificationMappingService {
    constructor(
        @InjectRepository(StreamBranchQualificationMapping)
        private readonly repo: Repository<StreamBranchQualificationMapping>,
    ) { }

    async findAll(page?: number, limit?: number, search?: string, qualificationId?: number) {
        const take = Number(limit) || 10;
        const skip = ((Number(page) || 1) - 1) * take;

        const qb = this.repo.createQueryBuilder('m')
            .leftJoinAndSelect('m.qualification', 'qualification')
            .leftJoinAndSelect('m.streamBranch', 'streamBranch')
            .leftJoinAndSelect('streamBranch.affiliation', 'affiliation')
            .leftJoinAndSelect('streamBranch.nsqf', 'nsqf')
            .leftJoinAndSelect('streamBranch.courseDuration', 'courseDuration')
            .where('m.is_active = :active', { active: 'Y' });

        if (qualificationId) {
            qb.andWhere('m.qualificationid = :qualificationId', { qualificationId });
        }

        if (search) {
            qb.andWhere('(LOWER(qualification.qualification) LIKE LOWER(:search) OR LOWER(streamBranch.stream_branch_name) LIKE LOWER(:search))', { search: `%${search}%` });
        }

        const [data, total] = await qb
            .orderBy('qualification.qualification', 'ASC')
            .addOrderBy('streamBranch.stream_branch_name', 'ASC')
            .skip(skip)
            .take(take)
            .getManyAndCount();

        return { data, total, page: Number(page) || 1, limit: take };
    }

    async findOne(id: number) {
        const item = await this.repo.findOne({
            where: { stream_branch_qualification_id: id } as any,
            relations: ['qualification', 'streamBranch'],
        });
        if (!item) throw new NotFoundException('StreamBranchQualificationMapping #' + id + ' not found');
        return item;
    }

    create(dto: Partial<StreamBranchQualificationMapping>) { return this.repo.save(this.repo.create(dto)); }

    async update(id: number, dto: Partial<StreamBranchQualificationMapping>) {
        await this.findOne(id);
        await this.repo.update({ stream_branch_qualification_id: id } as any, dto);
        return this.findOne(id);
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.repo.update({ stream_branch_qualification_id: id } as any, { is_active: 'N' } as any);
        return { message: 'StreamBranchQualificationMapping #' + id + ' deactivated' };
    }
}
