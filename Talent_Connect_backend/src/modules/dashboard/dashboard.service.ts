import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JobOffer } from '../job-offer/job-offer.entity';
import { Institute } from '../institute/institute.entity';
import { Industry } from '../industry/industry.entity';
import { Student } from '../student/student.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(JobOffer)
        private readonly jobOfferRepo: Repository<JobOffer>,
        @InjectRepository(Institute)
        private readonly instituteRepo: Repository<Institute>,
        @InjectRepository(Industry)
        private readonly industryRepo: Repository<Industry>,
        @InjectRepository(Student)
        private readonly studentRepo: Repository<Student>,
        private readonly dataSource: DataSource,
    ) { }

    async getStats() {
        const [
            totalEOI,
            discussed,
            accepted,
            rejected,
            initiated,
            pending,
            completed,
            totalInstitutes,
            totalIndustries,
        ] = await Promise.all([
            this.jobOfferRepo.count(),
            this.jobOfferRepo.count({ where: { status: 'Discussed' } }),
            this.jobOfferRepo.count({ where: { status: 'Accepted' } }),
            this.jobOfferRepo.count({ where: { status: 'Rejected' } }),
            this.jobOfferRepo.count({ where: { status: 'Project initiated' } }),
            this.jobOfferRepo.count({ where: { status: 'Sent' } }), // Mapping 'Pending' to 'Sent' as per entity defaults
            this.jobOfferRepo.count({ where: { status: 'Project completed' } }),
            this.instituteRepo.count({ where: { is_active: 'Y' } }),
            this.industryRepo.count({ where: { is_active: 'Y' } }),
        ]);

        // Students on roll (Total sum of sc.studentcount)
        const totalStudentsRes = await this.dataSource.query(`
      SELECT COALESCE(SUM(sc.studentcount), 0) as total
      FROM student_count sc
      JOIN mapping_institute_qualification miq ON sc.institute_qualification_id = miq.institute_qualification_id
      WHERE miq.is_active = 'Y'
    `);
        const totalStudentsOnRoll = parseInt(totalStudentsRes[0].total, 10);

        // Students Available for placement (Final year students)
        const availableStudentsRes = await this.dataSource.query(`
      SELECT COALESCE(SUM(sc.studentcount), 0) as total
      FROM student_count sc
      JOIN mapping_institute_qualification miq ON sc.institute_qualification_id = miq.institute_qualification_id
      JOIN master_session ms ON sc.sessionid = ms.sessionid
      WHERE miq.is_active = 'Y'
        AND ms.session LIKE '%' || extract(year from current_date)::text
    `);
        const studentsAvailableForPlacement = parseInt(availableStudentsRes[0].total, 10);

        return {
            totalEOI,
            discussed,
            accepted,
            rejected,
            initiated,
            pending,
            completed,
            totalInstitutes,
            totalIndustries,
            totalStudentsOnRoll,
            studentsAvailableForPlacement,
        };
    }
}
