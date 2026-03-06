import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('master_nsqf')
export class MasterNsqf extends BaseEntity {
    @PrimaryGeneratedColumn()
    nsqfid: number;

    @Column({ type: 'decimal', precision: 3, scale: 1 })
    nsqf_level: number;
}
