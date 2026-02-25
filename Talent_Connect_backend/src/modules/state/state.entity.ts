import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('master_state')
export class State extends BaseEntity {
    @PrimaryGeneratedColumn()
    stateid: number;

    @Column({ type: 'varchar', length: 200 })
    statename: string;

    @Index({ unique: true })
    @Column({ type: 'int', unique: true })
    lgdstateid: number;
}
