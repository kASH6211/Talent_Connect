import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Institute } from '../institute/institute.entity';
import { Qualification } from '../qualification/qualification.entity';
import { Program } from '../program/program.entity';
import { StreamBranch } from '../stream-branch/stream-branch.entity';

@Entity('student_details')
export class Student extends BaseEntity {
    @PrimaryGeneratedColumn()
    student_id: number;

    @Column({ type: 'varchar', length: 200 })
    first_name: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    middle_name: string;

    @Column({ type: 'varchar', length: 200 })
    last_name: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    gender: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    date_of_birth: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    emailId: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    mobileno: string;

    @Column({ type: 'int', nullable: true })
    institute_id: number;

    @ManyToOne(() => Institute, { nullable: true })
    @JoinColumn({ name: 'institute_id' })
    institute: Institute;

    @Column({ type: 'int', nullable: true })
    qualificationid: number;

    @ManyToOne(() => Qualification, { nullable: true })
    @JoinColumn({ name: 'qualificationid' })
    qualification: Qualification;

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

    @Column({ type: 'varchar', length: 20, nullable: true })
    passing_year: string;

    @Column({ type: 'varchar', length: 10, nullable: true })
    percentage: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    address: string;

    @Column({ type: 'varchar', length: 6, nullable: true })
    pincode: string;
}
