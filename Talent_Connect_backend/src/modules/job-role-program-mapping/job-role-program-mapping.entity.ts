import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { JobRole } from '../job-role/job-role.entity';
import { Program } from '../program/program.entity';
import { StreamBranch } from '../stream-branch/stream-branch.entity';

@Entity('mapping_job_role_program')
export class JobRoleProgramMapping extends BaseEntity {
    @PrimaryGeneratedColumn()
    job_role_program_mapping_id: number;

    @Column({ type: 'int' })
    jobrole_id: number;

    @ManyToOne(() => JobRole)
    @JoinColumn({ name: 'jobrole_id' })
    jobRole: JobRole;

    @Column({ type: 'int' })
    programId: number;

    @ManyToOne(() => Program)
    @JoinColumn({ name: 'programId' })
    program: Program;

    @Column({ type: 'int', nullable: true })
    stream_branch_Id: number;

    @ManyToOne(() => StreamBranch, { nullable: true })
    @JoinColumn({ name: 'stream_branch_Id' })
    streamBranch: StreamBranch;
}
