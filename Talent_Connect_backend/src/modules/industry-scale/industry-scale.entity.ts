import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('master_industry_scale')
export class IndustryScale extends BaseEntity {
    @PrimaryGeneratedColumn()
    industry_scale_id: number;

    @Column({ type: 'varchar', length: 200 })
    industry_scale: string;

    @Column({ type: 'varchar', length: 80, nullable: true })
    industry_scale_abbreviation: string;
}
