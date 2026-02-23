import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    username: string;

    @Column({ type: 'varchar', length: 200, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255 })
    password_hash: string;

    /**
     * Role values:
     *   'admin'     – platform administrator
     *   'institute' – institute staff account
     *   'industry'  – industry/company account
     */
    @Column({ type: 'varchar', length: 20, default: 'admin' })
    role: string;

    /** FK to master_institute.institute_id — populated for 'institute' role accounts */
    @Column({ type: 'int', nullable: true })
    institute_id: number | null;

    /** FK to master_industry.industry_id — populated for 'industry' role accounts */
    @Column({ type: 'int', nullable: true })
    industry_id: number | null;

    @Column({ type: 'varchar', length: 1, default: 'Y' })
    is_active: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    created_date: string;
}
