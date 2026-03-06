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

    findAll(qualificationId?: number) {
        const qb = this.repo.createQueryBuilder('m')
            .leftJoinAndSelect('m.qualification', 'qualification')
            .leftJoinAndSelect('m.streamBranch', 'streamBranch')
            .leftJoinAndSelect('streamBranch.affiliation', 'affiliation')
            .leftJoinAndSelect('streamBranch.nsqf', 'nsqf')
            .leftJoinAndSelect('streamBranch.courseDuration', 'courseDuration');
        if (qualificationId) {
            qb.where('m.qualificationid = :qualificationId', { qualificationId });
        }
        return qb.getMany();
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
