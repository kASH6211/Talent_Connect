import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { InstituteType } from '../institute-type/institute-type.entity';

@Entity('master_institute_sub_type')
export class InstituteSubType extends BaseEntity {
    @PrimaryGeneratedColumn()
    institute_sub_type_id: number;

    @Column({ type: 'int' })
    institute_type_id: number;

    @ManyToOne(() => InstituteType)
    @JoinColumn({ name: 'institute_type_id' })
    instituteType: InstituteType;

    @Column({ type: 'varchar', length: 200 })
    institute_sub_type: string;

    @Column({ type: 'varchar', length: 80, nullable: true })
    institute_sub_abbreviation: string;
}
