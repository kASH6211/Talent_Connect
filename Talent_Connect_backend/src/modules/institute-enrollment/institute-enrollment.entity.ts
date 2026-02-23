import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('master_institute_enrollment')
export class InstituteEnrollment extends BaseEntity {
    @PrimaryGeneratedColumn()
    institute_enrollment_id: number;

    @Column({ type: 'varchar', length: 200 })
    instituteenrollmenttype: string;
}
