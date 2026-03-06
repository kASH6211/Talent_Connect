import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { InstituteQualificationMapping } from '../institute-qualification-mapping/institute-qualification-mapping.entity';
import { MasterSession } from '../master-session/master-session.entity';

@Entity('student_count')
@Index(['institute_qualification_id', 'sessionid'], { unique: true })
export class StudentCount extends BaseEntity {
    @PrimaryGeneratedColumn()
    studentcountid: number;

    @Column({ type: 'int' })
    institute_qualification_id: number;

    @ManyToOne(() => InstituteQualificationMapping)
    @JoinColumn({ name: 'institute_qualification_id' })
    instituteQualification: InstituteQualificationMapping;

    @Column({ type: 'int' })
    studentcount: number;

    @Column({ type: 'int' })
    sessionid: number;

    @ManyToOne(() => MasterSession)
    @JoinColumn({ name: 'sessionid' })
    session: MasterSession;
}
