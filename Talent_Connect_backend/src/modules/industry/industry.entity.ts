import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { LegalEntity } from '../legal-entity/legal-entity.entity';
import { IndustrySector } from '../industry-sector/industry-sector.entity';
import { IndustryScale } from '../industry-scale/industry-scale.entity';
import { State } from '../state/state.entity';
import { District } from '../district/district.entity';

@Entity('master_industry')
export class Industry extends BaseEntity {
    @PrimaryGeneratedColumn()
    industry_id: number;

    @Column({ type: 'varchar', length: 500 })
    industry_name: string;

    @Column({ type: 'int' })
    legal_entity_type_id: number;

    @ManyToOne(() => LegalEntity)
    @JoinColumn({ name: 'legal_entity_type_id' })
    legalEntity: LegalEntity;

    @Column({ type: 'int', nullable: true })
    industry_sector_id: number;

    @ManyToOne(() => IndustrySector, { nullable: true })
    @JoinColumn({ name: 'industry_sector_id' })
    industrySector: IndustrySector;

    @Column({ type: 'int', nullable: true })
    industry_scale_id: number;

    @ManyToOne(() => IndustryScale, { nullable: true })
    @JoinColumn({ name: 'industry_scale_id' })
    industryScale: IndustryScale;

    @Column({ type: 'char', length: 1, nullable: true })
    industry_rural_urban_status: string;

    @Column({ type: 'int', nullable: true })
    lgdstateId: number;

    @ManyToOne(() => State, { nullable: true })
    @JoinColumn({ name: 'lgdstateId', referencedColumnName: 'stateid' })
    state: State;

    @Column({ type: 'int', nullable: true })
    lgddistrictId: number;

    @ManyToOne(() => District, { nullable: true })
    @JoinColumn({ name: 'lgddistrictId', referencedColumnName: 'districtid' })
    district: District;

    @Column({ type: 'varchar', length: 500, nullable: true })
    address: string;

    @Column({ type: 'varchar', length: 6, nullable: true })
    pincode: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    phone: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    fax: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    url: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    emailId: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    altemailId: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    contactperson: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    designation: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    mobileno: string;

    @Column({ type: 'char', length: 1, nullable: true })
    startup_recognised: string;

    @Column({ type: 'bytea', nullable: true })
    industrylogo: Buffer;

    @Column({ type: 'varchar', length: 50, nullable: true })
    latitude: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    longitude: string;
}
