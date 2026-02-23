import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('master_industry_sector')
export class IndustrySector extends BaseEntity {
    @PrimaryGeneratedColumn()
    industry_sector_id: number;

    @Column({ type: 'varchar', length: 200 })
    industry_sector_type: string;

    @Column({ type: 'varchar', length: 80, nullable: true })
    industry_sector_type_abbreviation: string;
}
