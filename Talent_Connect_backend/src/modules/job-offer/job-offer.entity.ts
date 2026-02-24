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

    @Column({ type: 'varchar', length: 300 })
    job_title: string;

    @Column({ type: 'text', nullable: true })
    job_description: string;

    /** Comma-separated qualification IDs pre-filled from filters */
    @Column({ type: 'text', nullable: true })
    required_qualification_ids: string;

    /** Comma-separated program IDs pre-filled from filters */
    @Column({ type: 'text', nullable: true })
    required_program_ids: string;

    /** Comma-separated stream/branch IDs pre-filled from filters */
    @Column({ type: 'text', nullable: true })
    required_stream_ids: string;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    salary_min: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    salary_max: number;

    @Column({ type: 'varchar', length: 20, nullable: true })
    offer_date: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    last_date: string;

    @Column({ type: 'int', nullable: true })
    number_of_posts: number;

    /** Pending | Accepted | Rejected | Withdrawn */
    @Column({ type: 'varchar', length: 20, default: 'Pending' })
    status: string;
}
