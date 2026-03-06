/**
 * Talent Connect – Database Seeder
 * Run: npx ts-node -r tsconfig-paths/register src/database/seeds/seed.ts
 */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

dotenv.config({ path: `.env` });

// ─── Entity Imports ──────────────────────────────────────────────────────────
import { Board } from '../../modules/board/board.entity';
import { InstituteType } from '../../modules/institute-type/institute-type.entity';
import { InstituteSubType } from '../../modules/institute-sub-type/institute-sub-type.entity';
import { InstituteOwnershipType } from '../../modules/institute-ownership-type/institute-ownership-type.entity';
import { Affiliation } from '../../modules/affiliation/affiliation.entity';
import { Regulatory } from '../../modules/regulatory/regulatory.entity';
import { State } from '../../modules/state/state.entity';
import { District } from '../../modules/district/district.entity';
import { InstituteEnrollment } from '../../modules/institute-enrollment/institute-enrollment.entity';
import { TrainingType } from '../../modules/training-type/training-type.entity';
import { Qualification } from '../../modules/qualification/qualification.entity';
import { StreamBranch } from '../../modules/stream-branch/stream-branch.entity';
import { JobRole } from '../../modules/job-role/job-role.entity';
import { LegalEntity } from '../../modules/legal-entity/legal-entity.entity';
import { IndustrySector } from '../../modules/industry-sector/industry-sector.entity';
import { IndustryScale } from '../../modules/industry-scale/industry-scale.entity';
import { IdentifierType } from '../../modules/identifier-type/identifier-type.entity';
import { RequestType } from '../../modules/request-type/request-type.entity';
import { RequestStatus } from '../../modules/request-status/request-status.entity';
import { User } from '../../modules/users/user.entity';
import { MasterSession } from '../../modules/master-session/master-session.entity';
import { MasterNsqf } from '../../modules/master-nsqf/master-nsqf.entity';
import { MasterCourseDuration } from '../../modules/master-course-duration/master-course-duration.entity';

// ─── Data Source ─────────────────────────────────────────────────────────────
const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'talent_connect',
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: true,
});

const now = new Date().toISOString();

async function seed() {
    await ds.initialize();
    console.log('🌱 Database connected. Starting seed...\n');

    // ── 1. Boards / Universities ──────────────────────────────────────────────
    const boardRepo = ds.getRepository(Board);
    if ((await boardRepo.count()) === 0) {
        await boardRepo.save([
            { university_board_name: 'Central Board of Secondary Education', university_board_abbreviation: 'CBSE', is_active: 'Y', created_date: now, createdby: 'seed' },
            { university_board_name: 'Council for the Indian School Certificate Examinations', university_board_abbreviation: 'CISCE', is_active: 'Y', created_date: now, createdby: 'seed' },
            { university_board_name: 'Maharashtra State Board of Secondary and Higher Secondary Education', university_board_abbreviation: 'MSBSHSE', is_active: 'Y', created_date: now, createdby: 'seed' },
            { university_board_name: 'Gujarat Secondary and Higher Secondary Education Board', university_board_abbreviation: 'GSHSEB', is_active: 'Y', created_date: now, createdby: 'seed' },
            { university_board_name: 'Rajasthan Board of Secondary Education', university_board_abbreviation: 'RBSE', is_active: 'Y', created_date: now, createdby: 'seed' },
            { university_board_name: 'UP Board (Uttar Pradesh Madhyamik Shiksha Parishad)', university_board_abbreviation: 'UPMSP', is_active: 'Y', created_date: now, createdby: 'seed' },
        ]);
        console.log('✅ Boards seeded');
    } else { console.log('⏭  Boards already exist'); }

    // ── 2. Institute Types ────────────────────────────────────────────────────
    const itRepo = ds.getRepository(InstituteType);
    let instituteTypes: InstituteType[] = [];
    if ((await itRepo.count()) === 0) {
        instituteTypes = await itRepo.save([
            { institute_type: 'University', institute_abbreviation: 'UNI', is_active: 'Y', created_date: now, createdby: 'seed' },
            { institute_type: 'College', institute_abbreviation: 'COL', is_active: 'Y', created_date: now, createdby: 'seed' },
            { institute_type: 'Polytechnic', institute_abbreviation: 'POLY', is_active: 'Y', created_date: now, createdby: 'seed' },
            { institute_type: 'ITI (Industrial Training Institute)', institute_abbreviation: 'ITI', is_active: 'Y', created_date: now, createdby: 'seed' },
            { institute_type: 'School', institute_abbreviation: 'SCH', is_active: 'Y', created_date: now, createdby: 'seed' },
        ]);
        console.log('✅ Institute Types seeded');
    } else {
        instituteTypes = await itRepo.find();
        console.log('⏭  Institute Types already exist');
    }

    // ── 3. Institute Sub Types ───────────────────────────────────────────────
    const istRepo = ds.getRepository(InstituteSubType);
    if ((await istRepo.count()) === 0) {
        const uni = instituteTypes.find(t => t.institute_abbreviation === 'UNI');
        const col = instituteTypes.find(t => t.institute_abbreviation === 'COL');
        await istRepo.save([
            { institute_type_id: uni?.institute_type_id || 1, institute_sub_type: 'Central University', institute_sub_abbreviation: 'CU', is_active: 'Y', created_date: now, createdby: 'seed' },
            { institute_type_id: uni?.institute_type_id || 1, institute_sub_type: 'State University', institute_sub_abbreviation: 'SU', is_active: 'Y', created_date: now, createdby: 'seed' },
            { institute_type_id: uni?.institute_type_id || 1, institute_sub_type: 'Deemed University', institute_sub_abbreviation: 'DU', is_active: 'Y', created_date: now, createdby: 'seed' },
            { institute_type_id: col?.institute_type_id || 2, institute_sub_type: 'Engineering College', institute_sub_abbreviation: 'EC', is_active: 'Y', created_date: now, createdby: 'seed' },
            { institute_type_id: col?.institute_type_id || 2, institute_sub_type: 'Medical College', institute_sub_abbreviation: 'MC', is_active: 'Y', created_date: now, createdby: 'seed' },
            { institute_type_id: col?.institute_type_id || 2, institute_sub_type: 'Arts & Science College', institute_sub_abbreviation: 'ASC', is_active: 'Y', created_date: now, createdby: 'seed' },
        ]);
        console.log('✅ Institute Sub Types seeded');
    } else { console.log('⏭  Institute Sub Types already exist'); }

    // ── 4. Ownership Types ───────────────────────────────────────────────────
    const iotRepo = ds.getRepository(InstituteOwnershipType);
    if ((await iotRepo.count()) === 0) {
        await iotRepo.save([
            { institute_type: 'Government', institute_type_abbreviation: 'GOVT', is_active: 'Y', created_date: now, createdby: 'seed' },
            { institute_type: 'Government Aided', institute_type_abbreviation: 'GVT-AID', is_active: 'Y', created_date: now, createdby: 'seed' },
            { institute_type: 'Private Unaided', institute_type_abbreviation: 'PVT-UN', is_active: 'Y', created_date: now, createdby: 'seed' },
            { institute_type: 'Private Aided', institute_type_abbreviation: 'PVT-AID', is_active: 'Y', created_date: now, createdby: 'seed' },
            { institute_type: 'Autonomous', institute_type_abbreviation: 'AUTO', is_active: 'Y', created_date: now, createdby: 'seed' },
        ]);
        console.log('✅ Ownership Types seeded');
    } else { console.log('⏭  Ownership Types already exist'); }

    // ── 5. Affiliations ──────────────────────────────────────────────────────
    const affRepo = ds.getRepository(Affiliation);
    if ((await affRepo.count()) === 0) {
        await affRepo.save([
            { affiliating_body: 'Anna University', affiliating_body_abbreviation: 'AU', is_active: 'Y', created_date: now, createdby: 'seed' },
            { affiliating_body: 'Mumbai University', affiliating_body_abbreviation: 'MU', is_active: 'Y', created_date: now, createdby: 'seed' },
            { affiliating_body: 'Pune University (SPPU)', affiliating_body_abbreviation: 'SPPU', is_active: 'Y', created_date: now, createdby: 'seed' },
            { affiliating_body: 'GTU - Gujarat Technological University', affiliating_body_abbreviation: 'GTU', is_active: 'Y', created_date: now, createdby: 'seed' },
            { affiliating_body: 'AKTU - Dr. A.P.J. Abdul Kalam Technical University', affiliating_body_abbreviation: 'AKTU', is_active: 'Y', created_date: now, createdby: 'seed' },
            { affiliating_body: 'VTU - Visvesvaraya Technological University', affiliating_body_abbreviation: 'VTU', is_active: 'Y', created_date: now, createdby: 'seed' },
            { affiliating_body: 'JNTU - Jawaharlal Nehru Technological University', affiliating_body_abbreviation: 'JNTU', is_active: 'Y', created_date: now, createdby: 'seed' },
            { affiliating_body: 'Autonomous (not affiliated)', affiliating_body_abbreviation: 'AUTO', is_active: 'Y', created_date: now, createdby: 'seed' },
        ]);
        console.log('✅ Affiliations seeded');
    } else { console.log('⏭  Affiliations already exist'); }

    // ── 6. Regulatory Bodies ─────────────────────────────────────────────────
    const regRepo = ds.getRepository(Regulatory);
    if ((await regRepo.count()) === 0) {
        await regRepo.save([
            { regulatory_body: 'All India Council for Technical Education', regulatory_body_abbreviation: 'AICTE', is_active: 'Y', created_date: now, createdby: 'seed' },
            { regulatory_body: 'University Grants Commission', regulatory_body_abbreviation: 'UGC', is_active: 'Y', created_date: now, createdby: 'seed' },
            { regulatory_body: 'Medical Council of India', regulatory_body_abbreviation: 'MCI', is_active: 'Y', created_date: now, createdby: 'seed' },
            { regulatory_body: 'Bar Council of India', regulatory_body_abbreviation: 'BCI', is_active: 'Y', created_date: now, createdby: 'seed' },
            { regulatory_body: 'National Medical Commission', regulatory_body_abbreviation: 'NMC', is_active: 'Y', created_date: now, createdby: 'seed' },
            { regulatory_body: 'Ministry of Education', regulatory_body_abbreviation: 'MoE', is_active: 'Y', created_date: now, createdby: 'seed' },
        ]);
        console.log('✅ Regulatory Bodies seeded');
    } else { console.log('⏭  Regulatory Bodies already exist'); }

    // ── 7. States (all 28 states + 8 UTs) ───────────────────────────────────
    const stateRepo = ds.getRepository(State);
    let states: State[] = [];
    if ((await stateRepo.count()) === 0) {
        const stateData = [
            { statename: 'Andhra Pradesh', lgdstateid: 28 },
            { statename: 'Arunachal Pradesh', lgdstateid: 12 },
            { statename: 'Assam', lgdstateid: 18 },
            { statename: 'Bihar', lgdstateid: 10 },
            { statename: 'Chhattisgarh', lgdstateid: 22 },
            { statename: 'Goa', lgdstateid: 30 },
            { statename: 'Gujarat', lgdstateid: 24 },
            { statename: 'Haryana', lgdstateid: 6 },
            { statename: 'Himachal Pradesh', lgdstateid: 2 },
            { statename: 'Jharkhand', lgdstateid: 20 },
            { statename: 'Karnataka', lgdstateid: 29 },
            { statename: 'Kerala', lgdstateid: 32 },
            { statename: 'Madhya Pradesh', lgdstateid: 23 },
            { statename: 'Maharashtra', lgdstateid: 27 },
            { statename: 'Manipur', lgdstateid: 14 },
            { statename: 'Meghalaya', lgdstateid: 17 },
            { statename: 'Mizoram', lgdstateid: 15 },
            { statename: 'Nagaland', lgdstateid: 13 },
            { statename: 'Odisha', lgdstateid: 21 },
            { statename: 'Punjab', lgdstateid: 3 },
            { statename: 'Rajasthan', lgdstateid: 8 },
            { statename: 'Sikkim', lgdstateid: 11 },
            { statename: 'Tamil Nadu', lgdstateid: 33 },
            { statename: 'Telangana', lgdstateid: 36 },
            { statename: 'Tripura', lgdstateid: 16 },
            { statename: 'Uttar Pradesh', lgdstateid: 9 },
            { statename: 'Uttarakhand', lgdstateid: 5 },
            { statename: 'West Bengal', lgdstateid: 19 },
            // UTs
            { statename: 'Andaman and Nicobar Islands', lgdstateid: 35 },
            { statename: 'Chandigarh', lgdstateid: 4 },
            { statename: 'Dadra and Nagar Haveli and Daman and Diu', lgdstateid: 26 },
            { statename: 'Delhi (NCT)', lgdstateid: 7 },
            { statename: 'Jammu and Kashmir', lgdstateid: 1 },
            { statename: 'Ladakh', lgdstateid: 37 },
            { statename: 'Lakshadweep', lgdstateid: 31 },
            { statename: 'Puducherry', lgdstateid: 34 },
        ];
        states = await stateRepo.save(stateData.map(s => ({ ...s, is_active: 'Y', created_date: now, createdby: 'seed' })));
        console.log(`✅ ${states.length} States/UTs seeded`);
    } else {
        states = await stateRepo.find();
        console.log('⏭  States already exist');
    }

    // ── 8. District samples (Maharashtra, Gujarat, Karnataka) ────────────────
    const distRepo = ds.getRepository(District);
    if ((await distRepo.count()) === 0) {
        const mh = states.find(s => s.lgdstateid === 27);
        const gj = states.find(s => s.lgdstateid === 24);
        const ka = states.find(s => s.lgdstateid === 29);
        const tn = states.find(s => s.lgdstateid === 33);
        const dl = states.find(s => s.lgdstateid === 7);
        const up = states.find(s => s.lgdstateid === 9);

        const districtData = [
            // Maharashtra
            { districtname: 'Mumbai City', lgdstateid: mh?.lgdstateid || 27, lgddistrictId: 505 },
            { districtname: 'Pune', lgdstateid: mh?.lgdstateid || 27, lgddistrictId: 516 },
            { districtname: 'Nagpur', lgdstateid: mh?.lgdstateid || 27, lgddistrictId: 510 },
            { districtname: 'Nashik', lgdstateid: mh?.lgdstateid || 27, lgddistrictId: 511 },
            { districtname: 'Aurangabad', lgdstateid: mh?.lgdstateid || 27, lgddistrictId: 483 },
            // Gujarat
            { districtname: 'Ahmedabad', lgdstateid: gj?.lgdstateid || 24, lgddistrictId: 444 },
            { districtname: 'Surat', lgdstateid: gj?.lgdstateid || 24, lgddistrictId: 468 },
            { districtname: 'Vadodara', lgdstateid: gj?.lgdstateid || 24, lgddistrictId: 472 },
            { districtname: 'Rajkot', lgdstateid: gj?.lgdstateid || 24, lgddistrictId: 462 },
            // Karnataka
            { districtname: 'Bengaluru Urban', lgdstateid: ka?.lgdstateid || 29, lgddistrictId: 572 },
            { districtname: 'Mysuru', lgdstateid: ka?.lgdstateid || 29, lgddistrictId: 580 },
            { districtname: 'Hubli-Dharwad', lgdstateid: ka?.lgdstateid || 29, lgddistrictId: 575 },
            // Tamil Nadu
            { districtname: 'Chennai', lgdstateid: tn?.lgdstateid || 33, lgddistrictId: 603 },
            { districtname: 'Coimbatore', lgdstateid: tn?.lgdstateid || 33, lgddistrictId: 604 },
            { districtname: 'Madurai', lgdstateid: tn?.lgdstateid || 33, lgddistrictId: 622 },
            // Delhi
            { districtname: 'New Delhi', lgdstateid: dl?.lgdstateid || 7, lgddistrictId: 102 },
            { districtname: 'North Delhi', lgdstateid: dl?.lgdstateid || 7, lgddistrictId: 103 },
            // UP
            { districtname: 'Lucknow', lgdstateid: up?.lgdstateid || 9, lgddistrictId: 197 },
            { districtname: 'Kanpur Nagar', lgdstateid: up?.lgdstateid || 9, lgddistrictId: 188 },
        ];
        await distRepo.save(districtData.map(d => ({ ...d, is_active: 'Y', created_date: now, createdby: 'seed' })));
        console.log('✅ Districts seeded (representative set)');
    } else { console.log('⏭  Districts already exist'); }

    // ── 9. Institute Enrollment Types ────────────────────────────────────────
    const ieRepo = ds.getRepository(InstituteEnrollment);
    if ((await ieRepo.count()) === 0) {
        await ieRepo.save([
            { instituteenrollmenttype: 'Centralized Admission', is_active: 'Y', created_date: now, createdby: 'seed' },
            { instituteenrollmenttype: 'Direct Admission', is_active: 'Y', created_date: now, createdby: 'seed' },
            { instituteenrollmenttype: 'Mixed (Centralized + Direct)', is_active: 'Y', created_date: now, createdby: 'seed' },
        ]);
        console.log('✅ Institute Enrollment Types seeded');
    } else { console.log('⏭  Institute Enrollment Types already exist'); }

    // ── 10. Training Types ───────────────────────────────────────────────────
    const ttRepo = ds.getRepository(TrainingType);
    if ((await ttRepo.count()) === 0) {
        await ttRepo.save([
            { training_type: 'Industrial Training', is_active: 'Y', created_date: now, createdby: 'seed' },
            { training_type: 'Apprenticeship', is_active: 'Y', created_date: now, createdby: 'seed' },
            { training_type: 'Internship', is_active: 'Y', created_date: now, createdby: 'seed' },
            { training_type: 'Vocational Training', is_active: 'Y', created_date: now, createdby: 'seed' },
            { training_type: 'Skill Development', is_active: 'Y', created_date: now, createdby: 'seed' },
        ]);
        console.log('✅ Training Types seeded');
    } else { console.log('⏭  Training Types already exist'); }

    // ── 11. Qualifications ───────────────────────────────────────────────────
    const qualRepo = ds.getRepository(Qualification);
    let qualifications: Qualification[] = [];
    if ((await qualRepo.count()) === 0) {
        qualifications = await qualRepo.save([
            { qualification: '10th (SSC)', is_active: 'Y', created_date: now, createdby: 'seed' },
            { qualification: '12th (HSC)', is_active: 'Y', created_date: now, createdby: 'seed' },
            { qualification: 'ITI Certificate', is_active: 'Y', created_date: now, createdby: 'seed' },
            { qualification: 'Diploma (Polytechnic)', is_active: 'Y', created_date: now, createdby: 'seed' },
            { qualification: 'B.E. / B.Tech', is_active: 'Y', created_date: now, createdby: 'seed' },
            { qualification: 'B.Sc.', is_active: 'Y', created_date: now, createdby: 'seed' },
            { qualification: 'B.Com', is_active: 'Y', created_date: now, createdby: 'seed' },
            { qualification: 'B.A.', is_active: 'Y', created_date: now, createdby: 'seed' },
            { qualification: 'BCA', is_active: 'Y', created_date: now, createdby: 'seed' },
            { qualification: 'BBA / BMS', is_active: 'Y', created_date: now, createdby: 'seed' },
            { qualification: 'M.E. / M.Tech', is_active: 'Y', created_date: now, createdby: 'seed' },
            { qualification: 'M.Sc.', is_active: 'Y', created_date: now, createdby: 'seed' },
            { qualification: 'M.Com', is_active: 'Y', created_date: now, createdby: 'seed' },
            { qualification: 'MBA / MMS', is_active: 'Y', created_date: now, createdby: 'seed' },
            { qualification: 'MCA', is_active: 'Y', created_date: now, createdby: 'seed' },
            { qualification: 'Ph.D.', is_active: 'Y', created_date: now, createdby: 'seed' },
        ]);
        console.log('✅ Qualifications seeded');
    } else {
        qualifications = await qualRepo.find();
        console.log('⏭  Qualifications already exist');
    }

    // ── 12. [REMOVED] Programs ─────────────────────────────────────────────

    // ── 13. Stream / Branches ────────────────────────────────────────────────
    const sbRepo = ds.getRepository(StreamBranch);
    if ((await sbRepo.count()) === 0) {
        const be = qualifications.find(q => q.qualification === 'B.E. / B.Tech');
        const diploma = qualifications.find(q => q.qualification === 'Diploma (Polytechnic)');
        const iti = qualifications.find(q => q.qualification === 'ITI Certificate');
        const science = qualifications.find(q => q.qualification === 'B.Sc.');
        const commerce = qualifications.find(q => q.qualification === 'B.Com');
        const arts = qualifications.find(q => q.qualification === 'B.A.');

        const branches = [
            // Engineering branches
            { qualificationid: be?.qualificationid, stream_branch_name: 'Computer Science & Engineering', stream_branch_abbreviation: 'CSE' },
            { qualificationid: be?.qualificationid, stream_branch_name: 'Information Technology', stream_branch_abbreviation: 'IT' },
            { qualificationid: be?.qualificationid, stream_branch_name: 'Electronics & Communication Engg.', stream_branch_abbreviation: 'ECE' },
            { qualificationid: be?.qualificationid, stream_branch_name: 'Electrical Engineering', stream_branch_abbreviation: 'EE' },
            { qualificationid: be?.qualificationid, stream_branch_name: 'Mechanical Engineering', stream_branch_abbreviation: 'ME' },
            { qualificationid: be?.qualificationid, stream_branch_name: 'Civil Engineering', stream_branch_abbreviation: 'CE' },
            // Science
            { qualificationid: science?.qualificationid, stream_branch_name: 'Physics', stream_branch_abbreviation: 'PHY' },
            { qualificationid: science?.qualificationid, stream_branch_name: 'Chemistry', stream_branch_abbreviation: 'CHEM' },
            // Diploma
            { qualificationid: diploma?.qualificationid, stream_branch_name: 'Diploma in Computer Engineering', stream_branch_abbreviation: 'DCE' },
            { qualificationid: diploma?.qualificationid, stream_branch_name: 'Diploma in Mechanical Engineering', stream_branch_abbreviation: 'DME' },
            // ITI
            { qualificationid: iti?.qualificationid, stream_branch_name: 'Electrician', stream_branch_abbreviation: 'ELEC' },
            { qualificationid: iti?.qualificationid, stream_branch_name: 'Fitter', stream_branch_abbreviation: 'FTR' },
            // Commerce
            { qualificationid: commerce?.qualificationid, stream_branch_name: 'Accounts & Finance', stream_branch_abbreviation: 'BCom-AF' },
            // Arts
            { qualificationid: arts?.qualificationid, stream_branch_name: 'English Literature', stream_branch_abbreviation: 'ENG-LIT' },
        ];
        await sbRepo.save(branches.map(b => ({ ...b, is_active: 'Y', created_date: now, createdby: 'seed' })));
        console.log('✅ Stream/Branches seeded');
    } else { console.log('⏭  Stream/Branches already exist'); }

    // ── 14. Job Roles ─────────────────────────────────────────────────────────
    const jrRepo = ds.getRepository(JobRole);
    if ((await jrRepo.count()) === 0) {
        const jobRoles = [
            { jobrole: 'Software Engineer', jobdescription: 'Develops and maintains software applications' },
            { jobrole: 'Data Analyst', jobdescription: 'Analyzes datasets to extract business insights' },
            { jobrole: 'Data Scientist', jobdescription: 'Builds ML models and statistical analyses' },
            { jobrole: 'Full Stack Developer', jobdescription: 'Develops both frontend and backend of web apps' },
            { jobrole: 'DevOps Engineer', jobdescription: 'Manages CI/CD pipelines and cloud infrastructure' },
            { jobrole: 'Mechanical Engineer', jobdescription: 'Designs and maintains mechanical systems' },
            { jobrole: 'Electrical Engineer', jobdescription: 'Designs electrical systems and equipment' },
            { jobrole: 'Civil Engineer', jobdescription: 'Plans and oversees construction projects' },
            { jobrole: 'Production Engineer', jobdescription: 'Manages manufacturing processes' },
            { jobrole: 'Quality Control Engineer', jobdescription: 'Ensures products meet quality standards' },
            { jobrole: 'Business Analyst', jobdescription: 'Bridges IT and business using data analytics' },
            { jobrole: 'HR Executive', jobdescription: 'Manages recruitment and employee relations' },
            { jobrole: 'Sales Executive', jobdescription: 'Drives sales and client relationships' },
            { jobrole: 'Marketing Executive', jobdescription: 'Develops and executes marketing strategies' },
            { jobrole: 'Finance Analyst', jobdescription: 'Financial planning and analysis' },
            { jobrole: 'Chartered Accountant', jobdescription: 'Auditing, taxation, and financial advisory' },
            { jobrole: 'Network Engineer', jobdescription: 'Designs and maintains computer networks' },
            { jobrole: 'Cybersecurity Analyst', jobdescription: 'Protects digital systems from threats' },
            { jobrole: 'Embedded Systems Engineer', jobdescription: 'Develops firmware for embedded systems' },
            { jobrole: 'Operations Manager', jobdescription: 'Oversees daily operational activities' },
        ];
        await jrRepo.save(jobRoles.map(j => ({ ...j, is_active: 'Y', created_date: now, createdby: 'seed' })));
        console.log('✅ Job Roles seeded');
    } else { console.log('⏭  Job Roles already exist'); }

    // ── 15. Legal Entity Types ────────────────────────────────────────────────
    const leRepo = ds.getRepository(LegalEntity);
    if ((await leRepo.count()) === 0) {
        await leRepo.save([
            { legal_entity_type: 'Private Limited Company', legal_entity_type_abbreviation: 'Pvt. Ltd.', is_active: 'Y', created_date: now, createdby: 'seed' },
            { legal_entity_type: 'Public Limited Company', legal_entity_type_abbreviation: 'Ltd.', is_active: 'Y', created_date: now, createdby: 'seed' },
            { legal_entity_type: 'Limited Liability Partnership', legal_entity_type_abbreviation: 'LLP', is_active: 'Y', created_date: now, createdby: 'seed' },
            { legal_entity_type: 'Partnership Firm', legal_entity_type_abbreviation: 'PART', is_active: 'Y', created_date: now, createdby: 'seed' },
            { legal_entity_type: 'Proprietorship', legal_entity_type_abbreviation: 'PROP', is_active: 'Y', created_date: now, createdby: 'seed' },
            { legal_entity_type: 'Public Sector Undertaking', legal_entity_type_abbreviation: 'PSU', is_active: 'Y', created_date: now, createdby: 'seed' },
            { legal_entity_type: 'Government Organization', legal_entity_type_abbreviation: 'GOVT', is_active: 'Y', created_date: now, createdby: 'seed' },
            { legal_entity_type: 'Non-Profit Organization (NGO / Trust)', legal_entity_type_abbreviation: 'NGO', is_active: 'Y', created_date: now, createdby: 'seed' },
            { legal_entity_type: 'Cooperative Society', legal_entity_type_abbreviation: 'COOP', is_active: 'Y', created_date: now, createdby: 'seed' },
        ]);
        console.log('✅ Legal Entity Types seeded');
    } else { console.log('⏭  Legal Entity Types already exist'); }

    // ── 16. Industry Sectors ─────────────────────────────────────────────────
    const isecRepo = ds.getRepository(IndustrySector);
    if ((await isecRepo.count()) === 0) {
        await isecRepo.save([
            { industry_sector_type: 'Information Technology & Software', industry_sector_type_abbreviation: 'IT-SW', is_active: 'Y', created_date: now, createdby: 'seed' },
            { industry_sector_type: 'Manufacturing', industry_sector_type_abbreviation: 'MFG', is_active: 'Y', created_date: now, createdby: 'seed' },
            { industry_sector_type: 'Automobile & Auto Components', industry_sector_type_abbreviation: 'AUTO', is_active: 'Y', created_date: now, createdby: 'seed' },
            { industry_sector_type: 'Chemicals & Pharmaceuticals', industry_sector_type_abbreviation: 'CHEM', is_active: 'Y', created_date: now, createdby: 'seed' },
            { industry_sector_type: 'Banking, Financial Services & Insurance', industry_sector_type_abbreviation: 'BFSI', is_active: 'Y', created_date: now, createdby: 'seed' },
            { industry_sector_type: 'Healthcare & Life Sciences', industry_sector_type_abbreviation: 'HLTH', is_active: 'Y', created_date: now, createdby: 'seed' },
            { industry_sector_type: 'Construction & Real Estate', industry_sector_type_abbreviation: 'CONS', is_active: 'Y', created_date: now, createdby: 'seed' },
            { industry_sector_type: 'Retail & E-Commerce', industry_sector_type_abbreviation: 'RETL', is_active: 'Y', created_date: now, createdby: 'seed' },
            { industry_sector_type: 'Agriculture & Allied Industries', industry_sector_type_abbreviation: 'AGRI', is_active: 'Y', created_date: now, createdby: 'seed' },
            { industry_sector_type: 'Education & Training', industry_sector_type_abbreviation: 'EDU', is_active: 'Y', created_date: now, createdby: 'seed' },
            { industry_sector_type: 'Media & Entertainment', industry_sector_type_abbreviation: 'MEDIA', is_active: 'Y', created_date: now, createdby: 'seed' },
            { industry_sector_type: 'Logistics & Supply Chain', industry_sector_type_abbreviation: 'LOG', is_active: 'Y', created_date: now, createdby: 'seed' },
            { industry_sector_type: 'Energy & Power', industry_sector_type_abbreviation: 'ENRG', is_active: 'Y', created_date: now, createdby: 'seed' },
            { industry_sector_type: 'Aerospace & Defence', industry_sector_type_abbreviation: 'AERO', is_active: 'Y', created_date: now, createdby: 'seed' },
            { industry_sector_type: 'Hospitality & Tourism', industry_sector_type_abbreviation: 'HOSP', is_active: 'Y', created_date: now, createdby: 'seed' },
        ]);
        console.log('✅ Industry Sectors seeded');
    } else { console.log('⏭  Industry Sectors already exist'); }

    // ── 17. Industry Scales ──────────────────────────────────────────────────
    const iscRepo = ds.getRepository(IndustryScale);
    if ((await iscRepo.count()) === 0) {
        await iscRepo.save([
            { industry_scale: 'Micro (< 10 employees)', industry_scale_abbreviation: 'MICRO', is_active: 'Y', created_date: now, createdby: 'seed' },
            { industry_scale: 'Small (10–99 employees)', industry_scale_abbreviation: 'SMALL', is_active: 'Y', created_date: now, createdby: 'seed' },
            { industry_scale: 'Medium (100–499 employees)', industry_scale_abbreviation: 'MED', is_active: 'Y', created_date: now, createdby: 'seed' },
            { industry_scale: 'Large (500–4999 employees)', industry_scale_abbreviation: 'LARGE', is_active: 'Y', created_date: now, createdby: 'seed' },
            { industry_scale: 'Enterprise (5000+ employees)', industry_scale_abbreviation: 'ENT', is_active: 'Y', created_date: now, createdby: 'seed' },
        ]);
        console.log('✅ Industry Scales seeded');
    } else { console.log('⏭  Industry Scales already exist'); }

    // ── 18. Identifier Types ─────────────────────────────────────────────────
    const idtRepo = ds.getRepository(IdentifierType);
    if ((await idtRepo.count()) === 0) {
        await idtRepo.save([
            { identifier_type: 'GSTIN (GST Identification Number)', identifier_type_abbreviation: 'GSTIN', is_active: 'Y', created_date: now, createdby: 'seed' },
            { identifier_type: 'CIN (Corporate Identification Number)', identifier_type_abbreviation: 'CIN', is_active: 'Y', created_date: now, createdby: 'seed' },
            { identifier_type: 'PAN (Permanent Account Number)', identifier_type_abbreviation: 'PAN', is_active: 'Y', created_date: now, createdby: 'seed' },
            { identifier_type: 'MSME Registration Number', identifier_type_abbreviation: 'MSME', is_active: 'Y', created_date: now, createdby: 'seed' },
            { identifier_type: 'Udyam Registration Number', identifier_type_abbreviation: 'UDYAM', is_active: 'Y', created_date: now, createdby: 'seed' },
            { identifier_type: 'TAN (Tax Deduction Account Number)', identifier_type_abbreviation: 'TAN', is_active: 'Y', created_date: now, createdby: 'seed' },
        ]);
        console.log('✅ Identifier Types seeded');
    } else { console.log('⏭  Identifier Types already exist'); }

    // ── 19. Request Types ────────────────────────────────────────────────────
    const rtRepo = ds.getRepository(RequestType);
    if ((await rtRepo.count()) === 0) {
        await rtRepo.save([
            { request_type: 'Campus Placement', is_active: 'Y', created_date: now, createdby: 'seed' },
            { request_type: 'Industrial Training', is_active: 'Y', created_date: now, createdby: 'seed' },
            { request_type: 'Apprenticeship', is_active: 'Y', created_date: now, createdby: 'seed' },
            { request_type: 'Internship', is_active: 'Y', created_date: now, createdby: 'seed' },
            { request_type: 'Guest Lecture / Workshop', is_active: 'Y', created_date: now, createdby: 'seed' },
            { request_type: 'MOU / Partnership', is_active: 'Y', created_date: now, createdby: 'seed' },
        ]);
        console.log('✅ Request Types seeded');
    } else { console.log('⏭  Request Types already exist'); }

    // ── 20. Request Statuses ─────────────────────────────────────────────────
    const rsRepo = ds.getRepository(RequestStatus);
    if ((await rsRepo.count()) === 0) {
        await rsRepo.save([
            { request_status: 'Draft', is_active: 'Y', created_date: now, createdby: 'seed' },
            { request_status: 'Submitted', is_active: 'Y', created_date: now, createdby: 'seed' },
            { request_status: 'Under Review', is_active: 'Y', created_date: now, createdby: 'seed' },
            { request_status: 'Approved', is_active: 'Y', created_date: now, createdby: 'seed' },
            { request_status: 'Rejected', is_active: 'Y', created_date: now, createdby: 'seed' },
            { request_status: 'Completed', is_active: 'Y', created_date: now, createdby: 'seed' },
            { request_status: 'Cancelled', is_active: 'Y', created_date: now, createdby: 'seed' },
        ]);
        console.log('✅ Request Statuses seeded');
    } else { console.log('⏭  Request Statuses already exist'); }

    // ── 21. [REMOVED] Program ↔ Qualification Mappings ─────────────────────

    // ── 22. Master Sessions ──────────────────────────────────────────────────
    const msRepo = ds.getRepository(MasterSession);
    if ((await msRepo.count()) === 0) {
        await msRepo.save([
            { session: '2023-24', is_active: 'Y', created_date: now, createdby: 'seed' },
            { session: '2024-25', is_active: 'Y', created_date: now, createdby: 'seed' },
            { session: '2025-26', is_active: 'Y', created_date: now, createdby: 'seed' },
        ]);
        console.log('✅ Master Sessions seeded');
    } else { console.log('⏭  Master Sessions already exist'); }

    // ── 23. Master NSQF Levels ───────────────────────────────────────────────
    const nsqfRepo = ds.getRepository(MasterNsqf);
    if ((await nsqfRepo.count()) === 0) {
        await nsqfRepo.save([
            { nsqf_level: 1, is_active: 'Y', created_date: now, createdby: 'seed' },
            { nsqf_level: 2, is_active: 'Y', created_date: now, createdby: 'seed' },
            { nsqf_level: 3, is_active: 'Y', created_date: now, createdby: 'seed' },
            { nsqf_level: 4, is_active: 'Y', created_date: now, createdby: 'seed' },
            { nsqf_level: 5, is_active: 'Y', created_date: now, createdby: 'seed' },
            { nsqf_level: 6, is_active: 'Y', created_date: now, createdby: 'seed' },
            { nsqf_level: 7, is_active: 'Y', created_date: now, createdby: 'seed' },
            { nsqf_level: 8, is_active: 'Y', created_date: now, createdby: 'seed' },
            { nsqf_level: 9, is_active: 'Y', created_date: now, createdby: 'seed' },
            { nsqf_level: 10, is_active: 'Y', created_date: now, createdby: 'seed' },
        ]);
        console.log('✅ Master NSQF Levels seeded');
    } else { console.log('⏭  Master NSQF Levels already exist'); }

    // ── 24. Master Course Durations ──────────────────────────────────────────
    const cdRepo = ds.getRepository(MasterCourseDuration);
    if ((await cdRepo.count()) === 0) {
        await cdRepo.save([
            { courseduration: '6 Months', is_active: 'Y', created_date: now, createdby: 'seed' },
            { courseduration: '1 Year', is_active: 'Y', created_date: now, createdby: 'seed' },
            { courseduration: '2 Years', is_active: 'Y', created_date: now, createdby: 'seed' },
            { courseduration: '3 Years', is_active: 'Y', created_date: now, createdby: 'seed' },
            { courseduration: '4 Years', is_active: 'Y', created_date: now, createdby: 'seed' },
        ]);
        console.log('✅ Master Course Durations seeded');
    } else { console.log('⏭  Master Course Durations already exist'); }

    // ── 22. Seed Demo Institute & Industry (for login demo accounts) ──────────
    const instituteRepo = ds.getRepository('master_institute');
    let demoInstituteId: number | null = null;
    const existingInstitute = await instituteRepo.findOne({ where: { emailId: 'placement@techcollege.edu.in' } } as any);
    if (!existingInstitute) {
        const saved: any = await instituteRepo.save({
            institute_name: 'Pune Institute of Technology',
            institute_abbreviation: 'PIT',
            institutecity: 'Pune',
            pincode: '411041',
            emailId: 'placement@techcollege.edu.in',
            mobileno: '9876543210',
            is_active: 'Y',
            created_date: now,
            createdby: 'seed',
        });
        demoInstituteId = saved.institute_id;
        console.log('✅ Demo institute seeded (Pune Institute of Technology)');
    } else {
        demoInstituteId = (existingInstitute as any).institute_id;
        console.log('⏭  Demo institute already exists');
    }

    const industryRepo = ds.getRepository('master_industry');
    let demoIndustryId: number | null = null;
    const existingIndustry = await industryRepo.findOne({ where: { emailId: 'hr@techsolutions.in' } } as any);
    if (!existingIndustry) {
        // Get any existing legal entity id to satisfy NOT NULL constraint
        const firstLegalEntity: any = await ds.getRepository(LegalEntity).findOne({ where: {} });
        const legalEntityTypeId = firstLegalEntity?.legal_entity_id ?? 1;
        const saved: any = await industryRepo.save({
            industry_name: 'TechSolutions Pvt. Ltd.',
            legal_entity_type_id: legalEntityTypeId,
            address: 'Koramangala, Bengaluru',
            pincode: '560034',
            emailId: 'hr@techsolutions.in',
            mobileno: '9988776655',
            is_active: 'Y',
            created_date: now,
            createdby: 'seed',
        });
        demoIndustryId = saved.industry_id;
        console.log('✅ Demo industry seeded (TechSolutions Pvt. Ltd.)');
    } else {
        demoIndustryId = (existingIndustry as any).industry_id;
        console.log('⏭  Demo industry already exists');
    }

    // ── 23. Users ─────────────────────────────────────────────────────────────
    const userRepo = ds.getRepository(User);
    const usersToSeed = [
        {
            username: 'admin',
            email: 'admin@talentconnect.gov.in',
            password: 'admin123',
            role: 'admin',
            institute_id: null,
            industry_id: null,
        },
        {
            username: 'institute_pit',
            email: 'placement@techcollege.edu.in',
            password: 'institute123',
            role: 'institute',
            institute_id: demoInstituteId,
            industry_id: null,
        },
        {
            username: 'industry_ts',
            email: 'hr@techsolutions.in',
            password: 'industry123',
            role: 'industry',
            institute_id: null,
            industry_id: demoIndustryId,
        },
    ];

    for (const u of usersToSeed) {
        const exists = await userRepo.findOne({ where: { username: u.username } });
        if (!exists) {
            const password_hash = await bcrypt.hash(u.password, 10);
            await userRepo.save({
                username: u.username,
                email: u.email,
                password_hash,
                role: u.role,
                institute_id: u.institute_id,
                industry_id: u.industry_id,
                is_active: 'Y',
                created_date: now,
            });
            console.log(`✅ User seeded → ${u.username} (${u.role}) | password: ${u.password}`);
        } else {
            console.log(`⏭  User already exists → ${u.username}`);
        }
    }


    await ds.destroy();
    console.log('\n🎉 Seeding complete!');
}

seed().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
