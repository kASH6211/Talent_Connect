import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('master_industry_identifier_type')
export class IdentifierType extends BaseEntity {
    @PrimaryGeneratedColumn()
    identifier_type_id: number;

    @Column({ type: 'varchar', length: 200, nullable: true })
    identifier_type: string;

    @Column({ type: 'varchar', length: 80, nullable: true })
    identifier_type_abbreviation: string;
}
