import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Institute } from '../institute/institute.entity';
import { Program } from '../program/program.entity';
import { StreamBranch } from '../stream-branch/stream-branch.entity';

@Entity('mapping_institute_program')
export class InstituteProgramMapping extends BaseEntity {
    @PrimaryGeneratedColumn()
    program_institute_mapping_id: number;

    @Column({ type: 'int' })
    instituteId: number;

    @ManyToOne(() => Institute)
    @JoinColumn({ name: 'instituteId' })
    institute: Institute;

    @Column({ type: 'int' })
    programId: number;

    @ManyToOne(() => Program)
    @JoinColumn({ name: 'programId' })
    program: Program;

    @Column({ type: 'int' })
    stream_branch_Id: number;

    @ManyToOne(() => StreamBranch)
    @JoinColumn({ name: 'stream_branch_Id' })
    streamBranch: StreamBranch;

    @Column({ type: 'int', nullable: true })
    totalintake: number;
}
