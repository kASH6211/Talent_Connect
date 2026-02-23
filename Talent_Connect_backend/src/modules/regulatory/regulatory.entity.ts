import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('master_regulatory_body')
export class Regulatory extends BaseEntity {
    @PrimaryGeneratedColumn()
    regulatory_body_id: number;

    @Column({ type: 'varchar', length: 200 })
    regulatory_body: string;

    @Column({ type: 'varchar', length: 80, nullable: true })
    regulatory_body_abbreviation: string;
}
