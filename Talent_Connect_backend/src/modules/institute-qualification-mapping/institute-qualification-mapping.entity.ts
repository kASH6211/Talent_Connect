import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Institute } from '../institute/institute.entity';
import { Qualification } from '../qualification/qualification.entity';
import { StreamBranch } from '../stream-branch/stream-branch.entity';

@Entity('mapping_institute_qualification')
export class InstituteQualificationMapping extends BaseEntity {
    @PrimaryGeneratedColumn()
    institute_qualification_id: number;

    @Column({ type: 'int' })
    instituteId: number;

    @ManyToOne(() => Institute)
    @JoinColumn({ name: 'instituteId' })
    institute: Institute;

    @Column({ type: 'int' })
    qualificationid: number;

    @ManyToOne(() => Qualification)
    @JoinColumn({ name: 'qualificationid' })
    qualification: Qualification;

    @Column({ type: 'int', nullable: true, name: 'stream_branch_Id' })
    stream_branch_Id: number;

    @ManyToOne(() => StreamBranch, { nullable: true })
    @JoinColumn({ name: 'stream_branch_Id' })
    streamBranch: StreamBranch;
}

