import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { JobOffer } from './job-offer.entity';
import { InstituteService } from '../institute/institute.service';

export interface BulkOfferDto {
    institute_ids: number[];
    is_select_all?: boolean;
    district_ids?: string;
    qualification_ids?: string;
    stream_ids?: string;
    search?: string;
    eoi_type: string;           // 'Placement' | 'Industrial Training' | 'Collaboration'
    job_title?: string;
    job_description?: string;
    nature_of_engagement?: string;
    required_qualification_ids?: string;
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
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    preferred_qualification_ids?: string;
    preferred_stream_ids?: string;
    min_students_required?: number;
    number_of_institutes_required?: number;
    industry_id: number;
}

@Injectable()
export class JobOfferService {
    constructor(
        @InjectRepository(JobOffer)
        private readonly repo: Repository<JobOffer>,
        private readonly dataSource: DataSource,
        private readonly instituteService: InstituteService,
    ) { }

    /** Industry sends EOI to multiple institutes */
    async bulkCreate(dto: BulkOfferDto) {
        let instituteIds = dto.institute_ids || [];

        if (dto.is_select_all) {
            // Find all institutes matching the filters
            const searchResult = await this.instituteService.search({
                district_ids: dto.district_ids,
                qualification_ids: dto.qualification_ids,
                stream_ids: dto.stream_ids,
                search: dto.search,
                limit: 5000, // Large enough for all Punjab institutes
            });
            instituteIds = searchResult.data.map(i => i.institute_id);
        }

        const now = new Date().toISOString();
        const batch_id = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
        const offers = instituteIds.map(inst_id => this.repo.create({
            batch_id,
            industry_id: dto.industry_id,
            institute_id: inst_id,
            eoi_type: dto.eoi_type,
            job_title: dto.job_title,
            job_description: dto.job_description,
            nature_of_engagement: dto.nature_of_engagement,
            required_qualification_ids: dto.required_qualification_ids,
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
            contact_name: dto.contact_name,
            contact_email: dto.contact_email,
            contact_phone: dto.contact_phone,
            preferred_qualification_ids: dto.preferred_qualification_ids,
            preferred_stream_ids: dto.preferred_stream_ids,
            min_students_required: dto.min_students_required,
            number_of_institutes_required: dto.number_of_institutes_required,
            status: 'Sent',
            is_active: 'Y',
            created_date: now,
            createdby: 'industry',
        }));
        return this.repo.save(offers);
    }

    /** Sent EOIs for a specific industry */
    async getSentOffers(industry_id: number, page?: number, limit?: number) {
        const take = Number(limit) || 10;
        const skip = ((Number(page) || 1) - 1) * take;

        const [data, total] = await this.repo.findAndCount({
            where: { industry_id },
            relations: ['institute', 'industry', 'institute.district'],
            order: { offer_id: 'DESC' },
            take,
            skip,
        });

        return { data, total, page: Number(page) || 1, limit: take };
    }

    /** Received EOIs for a specific institute */
    async getReceivedOffers(institute_id: number, page?: number, limit?: number) {
        const take = Number(limit) || 10;
        const skip = ((Number(page) || 1) - 1) * take;

        const [data, total] = await this.repo.findAndCount({
            where: { institute_id },
            relations: ['industry', 'institute', 'institute.district'],
            order: { offer_id: 'DESC' },
            take,
            skip,
        });

        return { data, total, page: Number(page) || 1, limit: take };
    }

    /** Update status */
    async updateStatus(offer_id: number, status: string) {
        await this.repo.update(offer_id, { status });
        return this.repo.findOne({ where: { offer_id }, relations: ['industry', 'institute', 'institute.district'] });
    }

    /** Bulk update status */
    async bulkUpdateStatus(ids: number[], status: string) {
        await this.repo.update({ offer_id: In(ids) }, { status });
        return { success: true, count: ids.length };
    }

    async findAll(page?: number, limit?: number) {
        if (!page && !limit) {
            return this.repo.find({
                relations: ['industry', 'institute', 'institute.district', 'institute.instituteType', 'institute.instituteSubType'],
                order: { offer_id: 'DESC' },
            });
        }
        const take = Number(limit) || 10;
        const skip = ((Number(page) || 1) - 1) * take;
        const [data, total] = await this.repo.findAndCount({
            relations: ['industry', 'institute', 'institute.district', 'institute.instituteType', 'institute.instituteSubType'],
            order: { offer_id: 'DESC' },
            take,
            skip,
        });
        return { data, total, page: Number(page) || 1, limit: take };
    }
}
