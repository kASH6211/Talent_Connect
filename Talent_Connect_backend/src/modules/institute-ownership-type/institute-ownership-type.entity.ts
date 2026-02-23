import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('master_institute_ownership_type')
export class InstituteOwnershipType extends BaseEntity {
    @PrimaryGeneratedColumn()
    institute_ownership_type_id: number;

    @Column({ type: 'varchar', length: 200 })
    institute_type: string;

    @Column({ type: 'varchar', length: 80, nullable: true })
    institute_type_abbreviation: string;
}
