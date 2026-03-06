import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { JobRole } from '../job-role/job-role.entity';
import { Qualification } from '../qualification/qualification.entity';
import { StreamBranch } from '../stream-branch/stream-branch.entity';

@Entity('mapping_job_role_qualification')
export class JobRoleQualificationMapping extends BaseEntity {
    @PrimaryGeneratedColumn()
    job_role_qualification_mapping_id: number;

    @Column({ type: 'int' })
    jobrole_id: number;

    @ManyToOne(() => JobRole)
    @JoinColumn({ name: 'jobrole_id' })
    jobRole: JobRole;

    @Column({ type: 'int' })
    qualificationid: number;

    @ManyToOne(() => Qualification)
    @JoinColumn({ name: 'qualificationid' })
    qualification: Qualification;

    @Column({ type: 'int', nullable: true })
    stream_branch_Id: number;

    @ManyToOne(() => StreamBranch, { nullable: true })
    @JoinColumn({ name: 'stream_branch_Id' })
    streamBranch: StreamBranch;
}
