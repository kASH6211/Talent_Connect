import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('job_offer_status_history')
export class JobOfferStatusHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    offer_id: number;

    @Column()
    status: string;

    @Column({ type: 'text', nullable: true })
    response: string;

    @CreateDateColumn()
    created_at: Date;
}
