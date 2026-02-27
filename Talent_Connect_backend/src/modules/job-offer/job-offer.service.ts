import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { JobOffer } from './job-offer.entity';

export interface BulkOfferDto {
    institute_ids: number[];
    job_title: string;
    job_description?: string;
    required_qualification_ids?: string;
    required_program_ids?: string;
    required_stream_ids?: string;
    salary_min?: number;
    salary_max?: number;
    last_date?: string;
    number_of_posts?: number;
    industry_id: number;
}

@Injectable()
export class JobOfferService {
    constructor(
        @InjectRepository(JobOffer)
        private readonly repo: Repository<JobOffer>,
        private readonly dataSource: DataSource,
    ) { }

    /** Industry sends offer to multiple institutes */
    async bulkCreate(dto: BulkOfferDto) {
        const now = new Date().toISOString();
        const offers = dto.institute_ids.map(inst_id => this.repo.create({
            industry_id: dto.industry_id,
            institute_id: inst_id,
            job_title: dto.job_title,
            job_description: dto.job_description,
            required_qualification_ids: dto.required_qualification_ids,
            required_program_ids: dto.required_program_ids,
            required_stream_ids: dto.required_stream_ids,
            salary_min: dto.salary_min,
            salary_max: dto.salary_max,
            offer_date: now.substring(0, 10),
            last_date: dto.last_date,
            number_of_posts: dto.number_of_posts,
            status: 'Pending',
            is_active: 'Y',
            created_date: now,
            createdby: 'industry',
        }));
        return this.repo.save(offers);
    }

    /** Sent offers for a specific industry */
    async getSentOffers(industry_id: number) {
        return this.repo.find({
            where: { industry_id },
            relations: ['institute', 'industry', 'institute.district'],
            order: { offer_id: 'DESC' },
        });
    }

    /** Received offers for a specific institute */
    async getReceivedOffers(institute_id: number) {
        return this.repo.find({
            where: { institute_id },
            relations: ['industry', 'institute', 'institute.district'],
            order: { offer_id: 'DESC' },
        });
    }

    /** Update status (accept/reject/withdraw) */
    async updateStatus(offer_id: number, status: string) {
        await this.repo.update(offer_id, { status });
        return this.repo.findOne({ where: { offer_id }, relations: ['industry', 'institute', 'institute.district'] });
    }

    findAll() { return this.repo.find({ relations: ['industry', 'institute', 'institute.district'], order: { offer_id: 'DESC' } }); }
}
