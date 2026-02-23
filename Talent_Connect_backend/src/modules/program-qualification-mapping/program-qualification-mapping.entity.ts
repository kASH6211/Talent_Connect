import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Qualification } from '../qualification/qualification.entity';
import { Program } from '../program/program.entity';

@Entity('mapping_program_qualification')
export class ProgramQualificationMapping extends BaseEntity {
    @PrimaryGeneratedColumn()
    program_qualification_mapping_id: number;

    @Column({ type: 'int' })
    qualificationid: number;

    @ManyToOne(() => Qualification)
    @JoinColumn({ name: 'qualificationid' })
    qualification: Qualification;

    @Column({ type: 'int' })
    programId: number;

    @ManyToOne(() => Program)
    @JoinColumn({ name: 'programId' })
    program: Program;
}
