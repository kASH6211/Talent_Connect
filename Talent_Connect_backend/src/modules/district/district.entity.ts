import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { State } from '../state/state.entity';

@Entity('master_district')
export class District extends BaseEntity {
    @PrimaryGeneratedColumn()
    districtid: number;

    @Column({ type: 'int' })
    lgdstateid: number;

    @ManyToOne(() => State, { eager: true })
    @JoinColumn({ name: 'lgdstateid', referencedColumnName: 'stateid' })
    state: State;

    @Column({ type: 'varchar', length: 200 })
    districtname: string;

    @Index({ unique: true })
    @Column({ type: 'int', nullable: true, unique: true })
    lgddistrictId: number;
}
