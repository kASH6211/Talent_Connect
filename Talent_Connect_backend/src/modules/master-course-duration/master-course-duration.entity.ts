import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('master_course_duration')
export class MasterCourseDuration extends BaseEntity {
    @PrimaryGeneratedColumn()
    coursedurationid: number;

    @Column({ type: 'varchar', length: 20 })
    courseduration: string;
}
