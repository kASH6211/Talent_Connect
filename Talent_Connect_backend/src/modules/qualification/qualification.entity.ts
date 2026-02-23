import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('master_qualification')
export class Qualification extends BaseEntity {
    @PrimaryGeneratedColumn()
    qualificationid: number;

    @Column({ type: 'varchar', length: 200 })
    qualification: string;
}
