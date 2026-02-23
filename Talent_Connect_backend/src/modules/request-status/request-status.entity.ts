import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('master_industry_request_status')
export class RequestStatus extends BaseEntity {
    @PrimaryGeneratedColumn()
    request_status_id: number;

    @Column({ type: 'varchar', length: 200 })
    request_status: string;
}
