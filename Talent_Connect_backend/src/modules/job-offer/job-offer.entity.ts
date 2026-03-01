import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Institute } from '../institute/institute.entity';
import { Industry } from '../industry/industry.entity';

@Entity('industry_job_offer')
export class JobOffer extends BaseEntity {
    @PrimaryGeneratedColumn()
    offer_id: number;

    @Column({ type: 'int' })
    industry_id: number;

    @ManyToOne(() => Industry, { nullable: false })
    @JoinColumn({ name: 'industry_id' })
    industry: Industry;

    @Column({ type: 'int' })
    institute_id: number;

    @ManyToOne(() => Institute, { nullable: false })
    @JoinColumn({ name: 'institute_id' })
    institute: Institute;

    /** EOI type — determines the form fields used */
    @Column({ type: 'varchar', length: 50, nullable: true })
    eoi_type: string; // 'Placement' | 'Industrial Training' | 'Collaboration'

    /** Batch ID to group offers sent in the same bulk request */
    @Column({ type: 'varchar', length: 100, nullable: true })
    batch_id: string;

    /** Job title / job role (used for Placement & Industrial Training EOIs) */
    @Column({ type: 'varchar', length: 300, nullable: true })
    job_title: string;

    @Column({ type: 'text', nullable: true })
    job_description: string;

    /** Nature of engagement: Permanent / Contractual / Apprenticeship / Industrial traineeship */
    @Column({ type: 'varchar', length: 100, nullable: true })
    nature_of_engagement: string;

    /** Comma-separated qualification IDs pre-filled from filters */
    @Column({ type: 'text', nullable: true })
    required_qualification_ids: string;

    /** Comma-separated program IDs pre-filled from filters */
    @Column({ type: 'text', nullable: true })
    required_program_ids: string;

    /** Comma-separated stream/branch IDs pre-filled from filters */
    @Column({ type: 'text', nullable: true })
    required_stream_ids: string;

    /** Number of students / posts required */
    @Column({ type: 'int', nullable: true })
    number_of_posts: number;

    /** Experience: Fresher | 0-1 | 1-3 | 3+ */
    @Column({ type: 'varchar', length: 50, nullable: true })
    experience_required: string;

    /** Location of job posting or training */
    @Column({ type: 'varchar', length: 300, nullable: true })
    location: string;

    @Column({ type: 'boolean', default: false })
    is_remote: boolean;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    salary_min: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    salary_max: number;

    @Column({ type: 'varchar', length: 20, nullable: true })
    offer_date: string;

    /** Expected start date */
    @Column({ type: 'varchar', length: 20, nullable: true })
    start_date: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    last_date: string;

    /** Duration (for internships, OJT, dual system etc.) */
    @Column({ type: 'varchar', length: 100, nullable: true })
    duration: string;

    /** Comma-separated collaboration types (for Collaboration EOI) */
    @Column({ type: 'text', nullable: true })
    collaboration_types: string;

    /** Additional details / requirements */
    @Column({ type: 'text', nullable: true })
    additional_details: string;

    /**
     * Status values:
     * Sent | Discussed | Accepted | Rejected | Project initiated | Project completed | Withdrawn
     * (keeping Pending/Accepted/Rejected for backward compatibility with old records)
     */
    @Column({ type: 'varchar', length: 30, default: 'Sent' })
    status: string;
}
