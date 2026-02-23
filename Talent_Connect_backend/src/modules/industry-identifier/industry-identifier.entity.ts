import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Industry } from '../industry/industry.entity';
import { IdentifierType } from '../identifier-type/identifier-type.entity';

@Entity('master_industry_identifier')
export class IndustryIdentifier extends BaseEntity {
    @PrimaryGeneratedColumn()
    identifier_id: number;

    @Column({ type: 'int' })
    industry_id: number;

    @ManyToOne(() => Industry)
    @JoinColumn({ name: 'industry_id' })
    industry: Industry;

    @Column({ type: 'int', nullable: true })
    identifier_type_id: number;

    @ManyToOne(() => IdentifierType, { nullable: true })
    @JoinColumn({ name: 'identifier_type_id' })
    identifierType: IdentifierType;

    @Column({ type: 'varchar', length: 50, nullable: true })
    identifier_value: string;
}
