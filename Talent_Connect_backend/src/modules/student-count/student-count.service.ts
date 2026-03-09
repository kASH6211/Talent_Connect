import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentCount } from './student-count.entity';

@Injectable()
export class StudentCountService {
    constructor(
        @InjectRepository(StudentCount)
        private readonly repo: Repository<StudentCount>,
    ) { }

    async findAll(user?: any, page?: number, limit?: number, search?: string, instituteId?: number) {
        const take = Number(limit) || 10;
        const skip = ((Number(page) || 1) - 1) * take;

        const qb = this.repo.createQueryBuilder('sc')
            .leftJoinAndSelect('sc.instituteQualification', 'iqm')
            .leftJoinAndSelect('iqm.institute', 'institute')
            .leftJoinAndSelect('iqm.qualification', 'qualification')
            .leftJoinAndSelect('iqm.streamBranch', 'streamBranch')
            .leftJoinAndSelect('streamBranch.affiliation', 'affiliation')
            .leftJoinAndSelect('streamBranch.nsqf', 'nsqf')
            .leftJoinAndSelect('streamBranch.courseDuration', 'courseDuration')
            .leftJoinAndSelect('sc.session', 'session')
            .where('1=1');

        if (instituteId) {
            qb.andWhere('iqm.instituteId = :instituteId', { instituteId });
        } else if (user?.role === 'institute' && user?.institute_id) {
            qb.andWhere('iqm.instituteId = :instituteId', { instituteId: user.institute_id });
        }

        if (search) {
            qb.andWhere(
                '(LOWER(institute.institute_name) LIKE LOWER(:search) OR LOWER(qualification.qualification) LIKE LOWER(:search) OR LOWER(streamBranch.stream_branch_name) LIKE LOWER(:search))',
                { search: `%${search}%` }
            );
        }

        // Use clones for aggregations to avoid polluting the main query builder state
        const totalSumResult = await qb.clone().select('SUM(sc.studentcount)', 'total').getRawOne();
        const totalStudents = parseInt(totalSumResult.total) || 0;

        const qualificationStats = await qb.clone()
            .select('qualification.qualification', 'name')
            .addSelect('SUM(sc.studentcount)', 'total')
            .groupBy('qualification.qualification')
            .getRawMany()
            .then(res => res.map(q => ({
                name: q.name || 'Unknown',
                total: parseInt(q.total) || 0
            })));

        const [data, total] = await qb
            .orderBy('sc.studentcountid', 'DESC')
            .skip(skip)
            .take(take)
            .getManyAndCount();

        return { data, total, totalStudents, qualificationStats, page: Number(page) || 1, limit: take };
    }

    async findOne(id: number) {
        const item = await this.repo.findOne({
            where: { studentcountid: id } as any,
            relations: ['instituteQualification', 'instituteQualification.institute', 'instituteQualification.qualification', 'instituteQualification.streamBranch', 'session'],
        });
        if (!item) throw new NotFoundException('StudentCount #' + id + ' not found');
        return item;
    }

    async create(dto: Partial<StudentCount>) {
        return this.repo.save(this.repo.create(dto));
    }

    async update(id: number, dto: Partial<StudentCount>) {
        await this.findOne(id);
        await this.repo.update({ studentcountid: id } as any, dto);
        return this.findOne(id);
    }

    async remove(id: number) {
        await this.repo.delete(id);
        return { message: 'StudentCount #' + id + ' removed' };
    }

    async bulkSave(dtos: Partial<StudentCount>[]) {
        const results: StudentCount[] = [];
        for (const dto of dtos) {
            // Check if record already exists for this mapping and session
            let existing = await this.repo.findOne({
                where: {
                    institute_qualification_id: dto.institute_qualification_id,
                    sessionid: dto.sessionid
                } as any
            });

            if (existing) {
                // Update existing
                Object.assign(existing, dto);
                results.push(await this.repo.save(existing));
            } else {
                // Create new
                results.push(await this.repo.save(this.repo.create(dto)));
            }
        }
        return results;
    }
}
