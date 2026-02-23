import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('master_board')
export class Board extends BaseEntity {
    @PrimaryGeneratedColumn()
    university_board_id: number;

    @Column({ type: 'varchar', length: 500 })
    university_board_name: string;

    @Column({ type: 'varchar', length: 80, nullable: true })
    university_board_abbreviation: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    address: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    phoneno: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    emailId: string;

    @Column({ type: 'bytea', nullable: true })
    logoleft: Buffer;

    @Column({ type: 'bytea', nullable: true })
    logoright: Buffer;
}
