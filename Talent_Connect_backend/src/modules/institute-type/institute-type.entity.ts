import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('master_institute_type')
export class InstituteType extends BaseEntity {
    @PrimaryGeneratedColumn()
    institute_type_id: number;

    @Column({ type: 'varchar', length: 200 })
    institute_type: string;

    @Column({ type: 'varchar', length: 80, nullable: true })
    institute_abbreviation: string;
}
