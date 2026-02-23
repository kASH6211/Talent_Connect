import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Industry } from '../industry/industry.entity';
import { Institute } from '../institute/institute.entity';
import { RequestType } from '../request-type/request-type.entity';
import { RequestStatus } from '../request-status/request-status.entity';
import { Program } from '../program/program.entity';
import { StreamBranch } from '../stream-branch/stream-branch.entity';

@Entity('industry_request')
export class IndustryRequest extends BaseEntity {
    @PrimaryGeneratedColumn()
    industry_request_id: number;

    @Column({ type: 'int' })
    industry_id: number;

    @ManyToOne(() => Industry)
    @JoinColumn({ name: 'industry_id' })
    industry: Industry;

    @Column({ type: 'int', nullable: true })
    institute_id: number;

    @ManyToOne(() => Institute, { nullable: true })
    @JoinColumn({ name: 'institute_id' })
    institute: Institute;

    @Column({ type: 'int', nullable: true })
    request_type_id: number;

    @ManyToOne(() => RequestType, { nullable: true })
    @JoinColumn({ name: 'request_type_id' })
    requestType: RequestType;

    @Column({ type: 'int', nullable: true })
    request_status_id: number;

    @ManyToOne(() => RequestStatus, { nullable: true })
    @JoinColumn({ name: 'request_status_id' })
    requestStatus: RequestStatus;

    @Column({ type: 'int', nullable: true })
    programId: number;

    @ManyToOne(() => Program, { nullable: true })
    @JoinColumn({ name: 'programId' })
    program: Program;

    @Column({ type: 'int', nullable: true })
    stream_branch_Id: number;

    @ManyToOne(() => StreamBranch, { nullable: true })
    @JoinColumn({ name: 'stream_branch_Id' })
    streamBranch: StreamBranch;

    @Column({ type: 'int', nullable: true })
    vacancies: number;

    @Column({ type: 'varchar', length: 50, nullable: true })
    request_date: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    expiry_date: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    remarks: string;
}
