import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('master_industry_legal_entity_type')
export class LegalEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    legal_entity_type_id: number;

    @Column({ type: 'varchar', length: 200 })
    legal_entity_type: string;

    @Column({ type: 'varchar', length: 80, nullable: true })
    legal_entity_type_abbreviation: string;
}
