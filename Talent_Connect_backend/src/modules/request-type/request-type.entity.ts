import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('master_industry_request_type')
export class RequestType extends BaseEntity {
    @PrimaryGeneratedColumn()
    request_type_id: number;

    @Column({ type: 'varchar', length: 200 })
    request_type: string;
}
