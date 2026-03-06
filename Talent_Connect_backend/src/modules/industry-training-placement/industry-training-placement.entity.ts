import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Industry } from '../industry/industry.entity';
import { Qualification } from '../qualification/qualification.entity';
import { StreamBranch } from '../stream-branch/stream-branch.entity';

@Entity('industry_training_placement_preference')
export class IndustryTrainingPlacement extends BaseEntity {
    @PrimaryGeneratedColumn()
    preference_id: number;

    @Column({ type: 'int' })
    industry_id: number;

    @ManyToOne(() => Industry)
    @JoinColumn({ name: 'industry_id' })
    industry: Industry;

    @Column({ type: 'char', length: 1, nullable: true })
    is_industry_offer_industrial_training: string;

    @Column({ type: 'char', length: 1, nullable: true })
    is_industry_offer_apprenticeship: string;

    @Column({ type: 'char', length: 1, nullable: true })
    is_industry_offer_campus_placement: string;

    @Column({ type: 'int', nullable: true })
    qualificationid: number;

    @ManyToOne(() => Qualification, { nullable: true })
    @JoinColumn({ name: 'qualificationid' })
    qualification: Qualification;

    @Column({ type: 'int', nullable: true })
    stream_branch_Id: number;

    @ManyToOne(() => StreamBranch, { nullable: true })
    @JoinColumn({ name: 'stream_branch_Id' })
    streamBranch: StreamBranch;

    @Column({ type: 'int', nullable: true })
    trainee_capacity: number;

    @Column({ type: 'int', nullable: true })
    training_duration_months: number;

    @Column({ type: 'int', nullable: true })
    training_duration_days: number;
}
