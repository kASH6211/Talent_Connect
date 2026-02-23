import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Student } from '../student/student.entity';
import { Industry } from '../industry/industry.entity';
import { LegalEntity } from '../legal-entity/legal-entity.entity';
import { IndustrySector } from '../industry-sector/industry-sector.entity';

@Entity('student_placement_details')
export class StudentPlacement extends BaseEntity {
    @PrimaryGeneratedColumn()
    placement_id: number;

    @Column({ type: 'int' })
    student_id: number;

    @ManyToOne(() => Student)
    @JoinColumn({ name: 'student_id' })
    student: Student;

    @Column({ type: 'char', length: 1, nullable: true })
    placement_status: string;

    @Column({ type: 'int', nullable: true })
    industryid: number;

    @ManyToOne(() => Industry, { nullable: true })
    @JoinColumn({ name: 'industryid' })
    industry: Industry;

    @Column({ type: 'varchar', length: 500, nullable: true })
    institute_industry_name: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    job_designation: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    job_role: string;

    @Column({ type: 'int', nullable: true })
    legal_entity_type_id: number;

    @ManyToOne(() => LegalEntity, { nullable: true })
    @JoinColumn({ name: 'legal_entity_type_id' })
    legalEntity: LegalEntity;

    @Column({ type: 'int', nullable: true })
    sector_id: number;

    @ManyToOne(() => IndustrySector, { nullable: true })
    @JoinColumn({ name: 'sector_id' })
    sector: IndustrySector;

    @Column({ type: 'varchar', length: 200, nullable: true })
    offer_date: string;

    @Column({ type: 'date', nullable: true })
    joining_date: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    work_location: string;

    @Column({ type: 'char', length: 1, nullable: true })
    offer_accepted: string;
}
