import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('master_institute_training_type')
export class TrainingType extends BaseEntity {
    @PrimaryGeneratedColumn()
    training_type_id: number;

    @Column({ type: 'varchar', length: 200 })
    training_type: string;
}
