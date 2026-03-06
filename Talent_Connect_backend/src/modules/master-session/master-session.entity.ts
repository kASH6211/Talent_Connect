import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('master_session')
export class MasterSession extends BaseEntity {
    @PrimaryGeneratedColumn()
    sessionid: number;

    @Column({ type: 'varchar', length: 9 })
    session: string;
}
