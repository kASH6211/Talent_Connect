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

    async findAll(user?: any) {
        const qb = this.repo.createQueryBuilder('sc')
            .leftJoinAndSelect('sc.instituteQualification', 'iqm')
            .leftJoinAndSelect('iqm.institute', 'institute')
            .leftJoinAndSelect('iqm.qualification', 'qualification')
            .leftJoinAndSelect('iqm.streamBranch', 'streamBranch')
            .leftJoinAndSelect('streamBranch.affiliation', 'affiliation')
            .leftJoinAndSelect('streamBranch.nsqf', 'nsqf')
            .leftJoinAndSelect('streamBranch.courseDuration', 'courseDuration')
            .leftJoinAndSelect('sc.session', 'session')
            .orderBy('sc.studentcountid', 'DESC');

        if (user?.role === 'institute' && user?.institute_id) {
            qb.andWhere('iqm.instituteId = :instituteId', { instituteId: user.institute_id });
        }

        return qb.getMany();
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
