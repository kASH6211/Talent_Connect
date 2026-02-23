import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('master_affiliation_body')
export class Affiliation extends BaseEntity {
    @PrimaryGeneratedColumn()
    affiliating_body_id: number;

    @Column({ type: 'varchar', length: 200 })
    affiliating_body: string;

    @Column({ type: 'varchar', length: 80, nullable: true })
    affiliating_body_abbreviation: string;
}
