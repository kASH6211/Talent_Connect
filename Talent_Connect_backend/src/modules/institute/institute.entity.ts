import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Board } from '../board/board.entity';
import { InstituteType } from '../institute-type/institute-type.entity';
import { InstituteSubType } from '../institute-sub-type/institute-sub-type.entity';
import { InstituteOwnershipType } from '../institute-ownership-type/institute-ownership-type.entity';
import { Affiliation } from '../affiliation/affiliation.entity';
import { Regulatory } from '../regulatory/regulatory.entity';
import { State } from '../state/state.entity';
import { District } from '../district/district.entity';
import { InstituteEnrollment } from '../institute-enrollment/institute-enrollment.entity';
import { TrainingType } from '../training-type/training-type.entity';

@Entity('master_institute')
export class Institute extends BaseEntity {
    @PrimaryGeneratedColumn()
    institute_id: number;

    @Column({ type: 'int', nullable: true })
    university_board_id: number;

    @ManyToOne(() => Board, { nullable: true })
    @JoinColumn({ name: 'university_board_id' })
    board: Board;

    @Column({ type: 'varchar', length: 500 })
    institute_name: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    institute_abbreviation: string;

    @Column({ type: 'int', nullable: true })
    institute_type_id: number;

    @ManyToOne(() => InstituteType, { nullable: true })
    @JoinColumn({ name: 'institute_type_id' })
    instituteType: InstituteType;

    @Column({ type: 'int', nullable: true })
    institute_sub_type_id: number;

    @ManyToOne(() => InstituteSubType, { nullable: true })
    @JoinColumn({ name: 'institute_sub_type_id' })
    instituteSubType: InstituteSubType;

    @Column({ type: 'int', nullable: true })
    institute_ownership_type_id: number;

    @ManyToOne(() => InstituteOwnershipType, { nullable: true })
    @JoinColumn({ name: 'institute_ownership_type_id' })
    ownershipType: InstituteOwnershipType;

    @Column({ type: 'int', nullable: true })
    affiliating_body_id: number;

    @ManyToOne(() => Affiliation, { nullable: true })
    @JoinColumn({ name: 'affiliating_body_id' })
    affiliation: Affiliation;

    @Column({ type: 'int', nullable: true })
    regulatory_body_id: number;

    @ManyToOne(() => Regulatory, { nullable: true })
    @JoinColumn({ name: 'regulatory_body_id' })
    regulatory: Regulatory;

    @Column({ type: 'char', length: 1, nullable: true })
    institute_rural_urban_status: string;

    @Column({ type: 'int', nullable: true })
    lgdstateId: number;

    @ManyToOne(() => State, { nullable: true })
    @JoinColumn({ name: 'lgdstateId', referencedColumnName: 'stateid' })
    state: State;

    @Column({ type: 'int', nullable: true })
    lgddistrictId: number;

    @ManyToOne(() => District, { nullable: true })
    @JoinColumn({ name: 'lgddistrictId', referencedColumnName: 'districtid' })
    district: District;

    @Column({ type: 'varchar', length: 500, nullable: true })
    address: string;

    @Column({ type: 'varchar', length: 6, nullable: true })
    pincode: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    phone: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    fax: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    url: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    emailId: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    altemailId: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    contactperson: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    designation: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    mobileno: string;

    @Column({ type: 'int', nullable: true })
    institute_enrollment_id: number;

    @ManyToOne(() => InstituteEnrollment, { nullable: true })
    @JoinColumn({ name: 'institute_enrollment_id' })
    enrollmentType: InstituteEnrollment;

    @Column({ type: 'int', nullable: true })
    totalseatIntake: number;

    @Column({ type: 'char', length: 1, nullable: true })
    is_placement_cell_available: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    placement_officer_contact_number: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    placement_officer_email_id: string;

    @Column({ type: 'char', length: 1, nullable: true })
    is_institute_offerened_training: string;

    @Column({ type: 'int', nullable: true })
    training_type_id: number;

    @ManyToOne(() => TrainingType, { nullable: true })
    @JoinColumn({ name: 'training_type_id' })
    trainingType: TrainingType;

    @Column({ type: 'bytea', nullable: true })
    logoLeft: Buffer;

    @Column({ type: 'bytea', nullable: true })
    logoRight: Buffer;

    @Column({ type: 'varchar', length: 50, nullable: true })
    latitude: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    longitude: string;
}
