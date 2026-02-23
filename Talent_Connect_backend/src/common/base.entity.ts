import {
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
    @Column({ type: 'varchar', length: 1, nullable: true, default: 'Y' })
    is_active: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    created_date: string;

    @Column({ type: 'varchar', length: 15, nullable: true })
    createdby: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    updated_date: string;

    @Column({ type: 'varchar', length: 15, nullable: true })
    updatedby: string;
}
