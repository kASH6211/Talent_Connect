import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Qualification } from '../qualification/qualification.entity';
import { StreamBranch } from '../stream-branch/stream-branch.entity';

@Entity('mapping_stream_branch_qualification')
export class StreamBranchQualificationMapping extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'stream_branch_qualification_id' })
    stream_branch_qualification_id: number;

    @Column({ type: 'int' })
    qualificationid: number;

    @ManyToOne(() => Qualification)
    @JoinColumn({ name: 'qualificationid' })
    qualification: Qualification;

    @Column({ type: 'int', name: 'stream_branch_Id' })
    stream_branch_Id: number;

    @ManyToOne(() => StreamBranch)
    @JoinColumn({ name: 'stream_branch_Id' })
    streamBranch: StreamBranch;
}
