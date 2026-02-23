import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('master_job_role')
export class JobRole extends BaseEntity {
    @PrimaryGeneratedColumn()
    jobrole_id: number;

    @Column({ type: 'varchar', length: 200 })
    jobrole: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    jobdescription: string;
}
