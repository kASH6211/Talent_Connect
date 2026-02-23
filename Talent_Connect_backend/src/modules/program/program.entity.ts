import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('master_program')
export class Program extends BaseEntity {
    @PrimaryGeneratedColumn()
    programId: number;

    @Column({ type: 'varchar', length: 200 })
    program_name: string;

    @Column({ type: 'varchar', length: 80, nullable: true })
    program_abbreviation: string;
}
