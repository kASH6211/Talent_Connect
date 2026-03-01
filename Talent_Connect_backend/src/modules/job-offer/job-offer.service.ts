import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { JobOffer } from './job-offer.entity';

export interface BulkOfferDto {
    institute_ids: number[];
    eoi_type: string;           // 'Placement' | 'Industrial Training' | 'Collaboration'
    job_title?: string;
    job_description?: string;
    nature_of_engagement?: string;
    required_qualification_ids?: string;
    required_program_ids?: string;
    required_stream_ids?: string;
    number_of_posts?: number;
    experience_required?: string;
    location?: string;
    is_remote?: boolean;
    salary_min?: number;
    salary_max?: number;
    start_date?: string;
    last_date?: string;
    duration?: string;
    collaboration_types?: string;
    additional_details?: string;
    industry_id: number;
}

@Injectable()
export class JobOfferService {
    constructor(
        @InjectRepository(JobOffer)
        private readonly repo: Repository<JobOffer>,
        private readonly dataSource: DataSource,
    ) { }

    /** Industry sends EOI to multiple institutes */
    async bulkCreate(dto: BulkOfferDto) {
        const now = new Date().toISOString();
        const batch_id = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
        const offers = dto.institute_ids.map(inst_id => this.repo.create({
            batch_id,
            industry_id: dto.industry_id,
            institute_id: inst_id,
            eoi_type: dto.eoi_type,
            job_title: dto.job_title,
            job_description: dto.job_description,
            nature_of_engagement: dto.nature_of_engagement,
            required_qualification_ids: dto.required_qualification_ids,
            required_program_ids: dto.required_program_ids,
            required_stream_ids: dto.required_stream_ids,
            number_of_posts: dto.number_of_posts,
            experience_required: dto.experience_required,
            location: dto.location,
            is_remote: dto.is_remote ?? false,
            salary_min: dto.salary_min,
            salary_max: dto.salary_max,
            offer_date: now.substring(0, 10),
            start_date: dto.start_date,
            last_date: dto.last_date,
            duration: dto.duration,
            collaboration_types: dto.collaboration_types,
            additional_details: dto.additional_details,
            status: 'Sent',
            is_active: 'Y',
            created_date: now,
            createdby: 'industry',
        }));
        return this.repo.save(offers);
    }

    /** Sent EOIs for a specific industry */
    async getSentOffers(industry_id: number) {
        return this.repo.find({
            where: { industry_id },
            relations: ['institute', 'industry', 'institute.district'],
            order: { offer_id: 'DESC' },
        });
    }

    /** Received EOIs for a specific institute */
    async getReceivedOffers(institute_id: number) {
        return this.repo.find({
            where: { institute_id },
            relations: ['industry', 'institute', 'institute.district'],
            order: { offer_id: 'DESC' },
        });
    }

    /** Update status */
    async updateStatus(offer_id: number, status: string) {
        await this.repo.update(offer_id, { status });
        return this.repo.findOne({ where: { offer_id }, relations: ['industry', 'institute', 'institute.district'] });
    }

    findAll() { return this.repo.find({ relations: ['industry', 'institute', 'institute.district'], order: { offer_id: 'DESC' } }); }
}
