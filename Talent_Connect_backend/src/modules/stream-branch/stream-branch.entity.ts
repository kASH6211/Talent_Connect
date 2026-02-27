import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Program } from '../program/program.entity';
import { Affiliation } from '../affiliation/affiliation.entity';
import { Qualification } from '../qualification/qualification.entity';

@Entity('master_stream_branch')
export class StreamBranch extends BaseEntity {
    @PrimaryGeneratedColumn()
    stream_branch_Id: number;

    @Column({ type: 'int', nullable: true })
    programId: number;

    @ManyToOne(() => Program, { nullable: true })
    @JoinColumn({ name: 'programId' })
    program: Program;

    @Column({ type: 'varchar', length: 200 })
    stream_branch_name: string;

    @Column({ type: 'varchar', length: 80, nullable: true })
    stream_branch_abbreviation: string;

    @Column({ type: 'int', nullable: true })
    affiliating_body_id: number;

    @ManyToOne(() => Affiliation, { nullable: true })
    @JoinColumn({ name: 'affiliating_body_id' })
    affiliation: Affiliation;

    @Column({ type: 'int', nullable: true })
    qualificationid: number;

    @ManyToOne(() => Qualification, { eager: true, nullable: true })
    @JoinColumn({ name: 'qualificationid' })
    qualification: Qualification;
}
