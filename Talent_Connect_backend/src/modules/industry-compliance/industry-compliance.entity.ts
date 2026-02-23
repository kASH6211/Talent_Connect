import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Industry } from '../industry/industry.entity';

@Entity('industry_compliance_facility')
export class IndustryCompliance extends BaseEntity {
    @PrimaryGeneratedColumn()
    compliance_id: number;

    @Column({ type: 'int' })
    industry_id: number;

    @ManyToOne(() => Industry)
    @JoinColumn({ name: 'industry_id' })
    industry: Industry;

    @Column({ type: 'varchar', length: 50, nullable: true })
    factory_license_no: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    labour_license_no: string;

    @Column({ type: 'char', length: 1, nullable: true })
    is_safety_training_provided: string;

    @Column({ type: 'char', length: 1, nullable: true })
    is_accommodation_available: string;
}
