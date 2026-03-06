/**
 * Talent Connect – Demo Data Seeder
 * Seeds: 8 additional institutes (varied district/type/ownership) +
 *        48 students with realistic qualification and stream spread +
 *        4 additional industry records.
 *
 * Run: npx ts-node -r tsconfig-paths/register src/database/seeds/seed-demo.ts
 */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

dotenv.config({ path: `.env` });

const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'talent_connect',
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: false,
});

const now = new Date().toISOString();
const base = { is_active: 'Y', created_date: now, createdby: 'demo-seed' };

async function run() {
    await ds.initialize();
    console.log('🌱 Connected. Starting demo seed...\n');

    // ── Lookup master data ─────────────────────────────────────────────────────
    const districts = await ds.getRepository('master_district').find() as any[];
    const types = await ds.getRepository('master_institute_type').find() as any[];
    const ownerships = await ds.getRepository('master_institute_ownership_type').find() as any[];
    const quals = await ds.getRepository('master_qualification').find() as any[];
    const streams = await ds.getRepository('master_stream_branch').find() as any[];
    const legalEntities = await ds.getRepository('master_industry_legal_entity_type').find() as any[];

    if (districts.length === 0 || types.length === 0) {
        console.error('❌ Master data not seeded yet. Run seed.ts first.');
        process.exit(1);
    }

    // Helper lookups
    const distId = (name: string) => districts.find((d: any) => d.districtname.includes(name))?.districtid;
    const typeId = (abbr: string) => types.find((t: any) => t.institute_abbreviation === abbr)?.institute_type_id;
    const ownId = (abbr: string) => ownerships.find((o: any) => o.institute_type_abbreviation === abbr)?.institute_ownership_type_id;
    const qualId = (substr: string) => quals.find((q: any) => q.qualification.includes(substr))?.qualificationid;
    const streamId = (abbr: string) => streams.find((s: any) => s.stream_branch_abbreviation === abbr)?.stream_branch_Id;
    const legalId = (abbr: string) => legalEntities.find((l: any) => l.legal_entity_type_abbreviation === abbr)?.legal_entity_type_id
        ?? legalEntities[0]?.legal_entity_type_id;

    // ── 1. Institutes ──────────────────────────────────────────────────────────
    const instituteRepo = ds.getRepository('master_institute');

    const institutesToSeed = [
        {
            institute_name: 'Mumbai College of Engineering',
            institute_abbreviation: 'MCE',
            address: 'Andheri East, Mumbai',
            pincode: '400069',
            emailId: 'placements@mce.edu.in',
            mobileno: '9821000001',
            lgddistrictId: distId('Mumbai'),
            institute_type_id: typeId('COL'),
            institute_ownership_type_id: ownId('GOVT'),
        },
        {
            institute_name: 'Nagpur Polytechnic Institute',
            institute_abbreviation: 'NPTI',
            address: 'Sitabuldi, Nagpur',
            pincode: '440012',
            emailId: 'tpo@npti.ac.in',
            mobileno: '9820000002',
            lgddistrictId: distId('Nagpur'),
            institute_type_id: typeId('POLY'),
            institute_ownership_type_id: ownId('GVT-AID'),
        },
        {
            institute_name: 'Ahmedabad Institute of Technology',
            institute_abbreviation: 'AIT',
            address: 'Chandkheda, Ahmedabad',
            pincode: '382424',
            emailId: 'career@ait.edu.in',
            mobileno: '9920000003',
            lgddistrictId: distId('Ahmedabad'),
            institute_type_id: typeId('COL'),
            institute_ownership_type_id: ownId('PVT-UN'),
        },
        {
            institute_name: 'Surat Industrial Training Institute',
            institute_abbreviation: 'SITI',
            address: 'Katargam, Surat',
            pincode: '395004',
            emailId: 'placement@siti.iti.in',
            mobileno: '9920000004',
            lgddistrictId: distId('Surat'),
            institute_type_id: typeId('ITI'),
            institute_ownership_type_id: ownId('GOVT'),
        },
        {
            institute_name: 'Bengaluru University',
            institute_abbreviation: 'BU',
            address: 'Jnanabharathi Campus, Bengaluru',
            pincode: '560056',
            emailId: 'placements@bu.ac.in',
            mobileno: '9845000005',
            lgddistrictId: distId('Bengaluru'),
            institute_type_id: typeId('UNI'),
            institute_ownership_type_id: ownId('GOVT'),
        },
        {
            institute_name: 'Mysuru College of Science & Arts',
            institute_abbreviation: 'MCSA',
            address: 'Saraswathipuram, Mysuru',
            pincode: '570009',
            emailId: 'tpo@mcsa.edu.in',
            mobileno: '9845000006',
            lgddistrictId: distId('Mysuru'),
            institute_type_id: typeId('COL'),
            institute_ownership_type_id: ownId('PVT-AID'),
        },
        {
            institute_name: 'Chennai Institute of Technology',
            institute_abbreviation: 'CHIT',
            address: 'Kundrathur, Chennai',
            pincode: '600069',
            emailId: 'placements@chit.edu.in',
            mobileno: '9841000007',
            lgddistrictId: distId('Chennai'),
            institute_type_id: typeId('COL'),
            institute_ownership_type_id: ownId('AUTO'),
        },
        {
            institute_name: 'Nashik College of Commerce & Management',
            institute_abbreviation: 'NCCM',
            address: 'College Road, Nashik',
            pincode: '422005',
            emailId: 'career@nccm.edu.in',
            mobileno: '9822000008',
            lgddistrictId: distId('Nashik'),
            institute_type_id: typeId('COL'),
            institute_ownership_type_id: ownId('PVT-UN'),
        },
    ];

    const savedInstitutes: any[] = [];

    for (const inst of institutesToSeed) {
        const existing = await instituteRepo.findOne({ where: { emailId: inst.emailId } } as any);
        if (!existing) {
            const saved = await instituteRepo.save({ ...inst, ...base });
            savedInstitutes.push(saved);
            console.log(`✅ Institute: ${inst.institute_name}`);
        } else {
            savedInstitutes.push(existing);
            console.log(`⏭  Institute already exists: ${inst.institute_name}`);
        }
    }

    // ── 2. Students ────────────────────────────────────────────────────────────
    const studentRepo = ds.getRepository('student_details');
    const existingStudentCount = await studentRepo.count();
    if (existingStudentCount > 10) {
        console.log(`⏭  Students already seeded (${existingStudentCount} found)`);
    } else {
        // Build (institute, qual, stream) combos per institute
        const combos: Array<{
            inst: any; qual: string; strm: string;
            firstName: string; lastName: string; gender: string; year: string; pct: string;
        }> = [];

        // MCE – Engineering college → B.E./B.Tech, ENGG, CSE / ECE / ME / AIML
        const mce = savedInstitutes[0];
        [
            { fn: 'Aarav', ln: 'Mehta', g: 'M', strm: 'CSE', yr: '2025', pct: '78' },
            { fn: 'Shreya', ln: 'Patil', g: 'F', strm: 'ECE', yr: '2025', pct: '82' },
            { fn: 'Rohan', ln: 'Sharma', g: 'M', strm: 'ME', yr: '2024', pct: '71' },
            { fn: 'Ananya', ln: 'Joshi', g: 'F', strm: 'AIML', yr: '2025', pct: '88' },
            { fn: 'Kunal', ln: 'Desai', g: 'M', strm: 'IT', yr: '2026', pct: '75' },
            { fn: 'Priya', ln: 'Nair', g: 'F', strm: 'DS', yr: '2025', pct: '91' },
        ].forEach(s => combos.push({ inst: mce, qual: 'B.E.', strm: s.strm, firstName: s.fn, lastName: s.ln, gender: s.g, year: s.yr, pct: s.pct }));

        // NPTI – Polytechnic → Diploma, DIPL, DCE / DME / DECE
        const npti = savedInstitutes[1];
        [
            { fn: 'Suresh', ln: 'Rane', g: 'M', strm: 'DCE', yr: '2025', pct: '68' },
            { fn: 'Kavita', ln: 'Thakur', g: 'F', strm: 'DECE', yr: '2025', pct: '73' },
            { fn: 'Amit', ln: 'Kolhe', g: 'M', strm: 'DME', yr: '2024', pct: '65' },
            { fn: 'Pooja', ln: 'Wagh', g: 'F', strm: 'DCE', yr: '2026', pct: '79' },
            { fn: 'Nikhil', ln: 'Bhosale', g: 'M', strm: 'DME', yr: '2025', pct: '62' },
        ].forEach(s => combos.push({ inst: npti, qual: 'Diploma', strm: s.strm, firstName: s.fn, lastName: s.ln, gender: s.g, year: s.yr, pct: s.pct }));

        // AIT – Engineering college → B.E./B.Tech, ENGG, CSE / IT / EE
        const ait = savedInstitutes[2];
        [
            { fn: 'Tanvi', ln: 'Shah', g: 'F', strm: 'CSE', yr: '2025', pct: '85' },
            { fn: 'Parth', ln: 'Patel', g: 'M', strm: 'IT', yr: '2025', pct: '80' },
            { fn: 'Meenal', ln: 'Trivedi', g: 'F', strm: 'EE', yr: '2024', pct: '76' },
            { fn: 'Harsh', ln: 'Gandhi', g: 'M', strm: 'AIML', yr: '2025', pct: '89' },
            { fn: 'Nidhi', ln: 'Agarwal', g: 'F', strm: 'DS', yr: '2026', pct: '93' },
            { fn: 'Vivek', ln: 'Modi', g: 'M', strm: 'CSE', yr: '2025', pct: '77' },
        ].forEach(s => combos.push({ inst: ait, qual: 'B.E.', strm: s.strm, firstName: s.fn, lastName: s.ln, gender: s.g, year: s.yr, pct: s.pct }));

        // SITI – ITI → ITI Certificate, ITI, ELEC / FTR / COPA
        const siti = savedInstitutes[3];
        [
            { fn: 'Rajesh', ln: 'Gupta', g: 'M', strm: 'ELEC', yr: '2025', pct: '72' },
            { fn: 'Manisha', ln: 'Verma', g: 'F', strm: 'COPA', yr: '2025', pct: '78' },
            { fn: 'Deepak', ln: 'Singh', g: 'M', strm: 'FTR', yr: '2024', pct: '64' },
            { fn: 'Sunita', ln: 'Kumari', g: 'F', strm: 'COPA', yr: '2026', pct: '82' },
            { fn: 'Mohan', ln: 'Solanki', g: 'M', strm: 'ELEC', yr: '2025', pct: '69' },
        ].forEach(s => combos.push({ inst: siti, qual: 'ITI', strm: s.strm, firstName: s.fn, lastName: s.ln, gender: s.g, year: s.yr, pct: s.pct }));

        // BU – University → MBA / M.Sc. → MGMT / SCI
        const bu = savedInstitutes[4];
        [
            { fn: 'Aishwarya', ln: 'Reddy', g: 'F', qual: 'MBA', strm: 'MKT', yr: '2025', pct: '84' },
            { fn: 'Kiran', ln: 'Kumar', g: 'M', qual: 'MBA', strm: 'FIN', yr: '2025', pct: '88' },
            { fn: 'Riya', ln: 'Bhat', g: 'F', qual: 'M.Sc.', strm: 'BIO', yr: '2024', pct: '76' },
            { fn: 'Sanjay', ln: 'Gowda', g: 'M', qual: 'B.E.', strm: 'CE', yr: '2025', pct: '71' },
            { fn: 'Divya', ln: 'Hegde', g: 'F', qual: 'M.Sc.', strm: 'PHY', yr: '2026', pct: '80' },
            { fn: 'Arjun', ln: 'Rao', g: 'M', qual: 'MBA', strm: 'HR', yr: '2025', pct: '82' },
        ].forEach(s => combos.push({ inst: bu, qual: s.qual, strm: s.strm, firstName: s.fn, lastName: s.ln, gender: s.g, year: s.yr, pct: s.pct }));

        // MCSA – Arts & Science → B.Sc. / B.A. → SCI / ARTS
        const mcsa = savedInstitutes[5];
        [
            { fn: 'Varsha', ln: 'Naik', g: 'F', qual: 'B.Sc.', strm: 'MATH', yr: '2025', pct: '74' },
            { fn: 'Manoj', ln: 'Kamath', g: 'M', qual: 'B.A.', strm: 'ECO', yr: '2025', pct: '69' },
            { fn: 'Sneha', ln: 'Shetty', g: 'F', qual: 'B.Sc.', strm: 'BIO', yr: '2024', pct: '77' },
            { fn: 'Karthik', ln: 'Prabhu', g: 'M', qual: 'B.A.', strm: 'ENG-LIT', yr: '2026', pct: '71' },
        ].forEach(s => combos.push({ inst: mcsa, qual: s.qual, strm: s.strm, firstName: s.fn, lastName: s.ln, gender: s.g, year: s.yr, pct: s.pct }));

        // CHIT – Chennai Engineering → B.E./B.Tech, ENGG, CSE / ECE / AIML
        const chit = savedInstitutes[6];
        [
            { fn: 'Preethi', ln: 'Krishnan', g: 'F', strm: 'CSE', yr: '2025', pct: '90' },
            { fn: 'Rajkumar', ln: 'Murugan', g: 'M', strm: 'ECE', yr: '2025', pct: '83' },
            { fn: 'Kavitha', ln: 'Subramanian', g: 'F', strm: 'AIML', yr: '2024', pct: '87' },
            { fn: 'Dinesh', ln: 'Babu', g: 'M', strm: 'IT', yr: '2025', pct: '79' },
            { fn: 'Sathya', ln: 'Rajan', g: 'M', strm: 'DS', yr: '2026', pct: '85' },
            { fn: 'Meena', ln: 'Pillai', g: 'F', strm: 'CSE', yr: '2025', pct: '88' },
        ].forEach(s => combos.push({ inst: chit, qual: 'B.E.', strm: s.strm, firstName: s.fn, lastName: s.ln, gender: s.g, year: s.yr, pct: s.pct }));

        // NCCM – Commerce/Management → B.Com / BBA / MBA → COM / MGMT
        const nccm = savedInstitutes[7];
        [
            { fn: 'Pallavi', ln: 'Borse', g: 'F', qual: 'B.Com', strm: 'BCom-AF', yr: '2025', pct: '76' },
            { fn: 'Rahul', ln: 'Gaikwad', g: 'M', qual: 'BBA / BMS', strm: 'MKT', yr: '2025', pct: '73' },
            { fn: 'Shital', ln: 'Kadam', g: 'F', qual: 'B.Com', strm: 'BCom-BI', yr: '2024', pct: '80' },
            { fn: 'Omkar', ln: 'Darekar', g: 'M', qual: 'BBA / BMS', strm: 'FIN', yr: '2025', pct: '78' },
            { fn: 'Arti', ln: 'Sawant', g: 'F', qual: 'MBA / MMS', strm: 'HR', yr: '2025', pct: '83' },
        ].forEach(s => combos.push({ inst: nccm, qual: s.qual, strm: s.strm, firstName: s.fn, lastName: s.ln, gender: s.g, year: s.yr, pct: s.pct }));

        // Now save all students
        let studentCount = 0;
        for (const c of combos) {
            const qId = qualId(c.qual);
            const sId = streamId(c.strm);
            if (!c.inst?.institute_id) { console.warn(`⚠  Skipping student ${c.firstName} — institute not found`); continue; }
            if (!qId) { console.warn(`⚠  Skipping student ${c.firstName} — qual not resolved (qual:${c.qual})`); continue; }
            await studentRepo.save({
                first_name: c.firstName,
                last_name: c.lastName,
                gender: c.gender,
                institute_id: c.inst.institute_id,
                qualificationid: qId ?? null,
                stream_branch_Id: sId ?? null,
                passing_year: c.year,
                percentage: c.pct,
                emailId: `${c.firstName.toLowerCase()}.${c.lastName.toLowerCase()}@student.edu.in`,
                mobileno: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
                address: c.inst.address,
                pincode: c.inst.pincode,
                ...base,
            });
            studentCount++;
        }
        console.log(`✅ ${studentCount} students seeded`);
    }

    // ── 2.b Institute ↔ Qualification Mappings ──────────────────────────────
    const ipmRepo = ds.getRepository('mapping_institute_qualification');
    const mappingsToSeed: any[] = [];
    const getInst = (abbr: string) => savedInstitutes.find((i: any) => i.institute_abbreviation === abbr);

    if (savedInstitutes.length > 0) {
        const mce = getInst('MCE');
        const npti = getInst('NPTI');
        const ait = getInst('AIT');
        const siti = getInst('SITI');
        const bu = getInst('BU');
        const mcsa = getInst('MCSA');
        const chit = getInst('CHIT');
        const nccm = getInst('NCCM');

        const addMapping = (inst: any, qualSubstr: string, streams: string[]) => {
            if (!inst) return;
            const qId = qualId(qualSubstr);
            if (!qId) return;

            streams.forEach(strmAbbr => {
                const sId = streamId(strmAbbr);
                if (sId) {
                    mappingsToSeed.push({
                        instituteId: inst.institute_id,
                        qualificationid: qId,
                        stream_branch_Id: sId,
                        totalintake: 60
                    });
                }
            });
        };

        addMapping(mce, 'B.E.', ['CSE', 'IT', 'ECE', 'ME']);
        addMapping(npti, 'Diploma', ['DCE', 'DME']);
        addMapping(ait, 'B.E.', ['CSE', 'IT']);
        addMapping(siti, 'ITI', ['ELEC', 'FTR']);
        addMapping(bu, 'MBA', ['MKT', 'FIN', 'HR']);
        addMapping(mcsa, 'B.Sc.', ['MATH', 'BIO']);
        addMapping(chit, 'B.E.', ['CSE', 'IT']);
        addMapping(nccm, 'B.Com', ['BCom-AF']);
    }

    let mappingCount = 0;
    for (const m of mappingsToSeed) {
        const exists = await ipmRepo.findOne({
            where: {
                instituteId: m.instituteId,
                qualificationid: m.qualificationid,
                stream_branch_Id: m.stream_branch_Id
            }
        } as any);

        if (!exists) {
            await ipmRepo.save({ ...m, ...base });
            mappingCount++;
        }
    }
    console.log(`✅ ${mappingCount} Institute-Qualification mappings seeded`);

    // ── 2.c Job Role ↔ Qualification Mappings ──────────────────────────────
    const jrpmRepo = ds.getRepository('mapping_job_role_qualification');
    const jobRoles = await ds.getRepository('master_job_role').find() as any[];
    const getJobRoleId = (role: string) => jobRoles.find((j: any) => j.jobrole === role)?.jobrole_id;

    const roleMappings = [
        { role: 'Software Engineer', qual: 'B.E.', streams: ['CSE', 'IT'] },
        { role: 'Mechanical Engineer', qual: 'B.E.', streams: ['ME'] },
        { role: 'Mechanical Engineer', qual: 'Diploma', streams: ['DME'] },
        { role: 'HR Executive', qual: 'MBA', streams: ['HR'] },
        { role: 'Finance Analyst', qual: 'B.Com', streams: ['BCom-AF'] },
    ];

    let jrMappingCount = 0;
    for (const map of roleMappings) {
        const jrId = getJobRoleId(map.role);
        const qId = qualId(map.qual);

        if (!jrId || !qId) continue;

        for (const strm of map.streams) {
            const sId = streamId(strm);
            if (!sId) continue;

            const exists = await jrpmRepo.findOne({
                where: { jobrole_id: jrId, qualificationid: qId, stream_branch_Id: sId }
            } as any);

            if (!exists) {
                await jrpmRepo.save({
                    jobrole_id: jrId,
                    qualificationid: qId,
                    stream_branch_Id: sId,
                    ...base
                });
                jrMappingCount++;
            }
        }
    }
    console.log(`✅ ${jrMappingCount} Job Role-Qualification mappings seeded`);

    // ── 3. Additional Industries ───────────────────────────────────────────────
    const industryRepo = ds.getRepository('master_industry');

    const industriesToSeed = [
        {
            industry_name: 'InfraCore Systems Ltd.',
            legal_entity_type_id: legalId('Ltd.'),
            address: 'HITEC City, Hyderabad',
            pincode: '500081',
            emailId: 'careers@infracore.in',
            mobileno: '9040000011',
        },
        {
            industry_name: 'AutoMotive Precision Pvt. Ltd.',
            legal_entity_type_id: legalId('Pvt. Ltd.'),
            address: 'Peenya Industrial Area, Bengaluru',
            pincode: '560058',
            emailId: 'hr@autoprecision.in',
            mobileno: '9845000012',
        },
        {
            industry_name: 'GreenBuild Infrastructure LLP',
            legal_entity_type_id: legalId('LLP'),
            address: 'Baner, Pune',
            pincode: '411045',
            emailId: 'talent@greenbuild.in',
            mobileno: '9822000013',
        },
        {
            industry_name: 'DataNova Analytics Pvt. Ltd.',
            legal_entity_type_id: legalId('Pvt. Ltd.'),
            address: 'T Nagar, Chennai',
            pincode: '600017',
            emailId: 'recruit@datanova.in',
            mobileno: '9841000014',
        },
        {
            industry_name: 'Meridian Finance Ltd.',
            legal_entity_type_id: legalId('Ltd.'),
            address: 'Nariman Point, Mumbai',
            pincode: '400021',
            emailId: 'campus@meridianfinance.com',
            mobileno: '9820000015',
        },
    ];

    let industryCount = 0;
    for (const ind of industriesToSeed) {
        const existing = await industryRepo.findOne({ where: { emailId: ind.emailId } } as any);
        if (!existing) {
            await industryRepo.save({ ...ind, ...base });
            industryCount++;
            console.log(`✅ Industry: ${ind.industry_name}`);
        } else {
            console.log(`⏭  Industry already exists: ${ind.industry_name}`);
        }
    }

    // ── 4. Create users for every institute & industry ────────────────────────
    const userRepo = ds.getRepository('users');
    const instPwd = await bcrypt.hash('institute123', 10);
    const indPwd = await bcrypt.hash('industry123', 10);

    // -- Institute users --
    const allInstitutes = await instituteRepo.find() as any[];
    let instUsersCreated = 0;
    for (const inst of allInstitutes) {
        // Check if any user already uses this institute_id
        const linked = await userRepo.findOne({ where: { institute_id: inst.institute_id } } as any);
        if (linked) continue;

        // Derive a clean slug from the abbreviation or name
        const slug = (inst.institute_abbreviation ?? inst.institute_name)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .substring(0, 20);
        const username = `inst_${slug}`;
        const email = inst.emailId ?? `${slug}@institute.in`;

        const existsByName = await userRepo.findOne({ where: { username } } as any);
        if (existsByName) continue;

        await userRepo.save({
            username,
            email,
            password_hash: instPwd,
            role: 'institute',
            institute_id: inst.institute_id,
            industry_id: null,
            is_active: 'Y',
            created_date: now,
        });
        instUsersCreated++;
        console.log(`✅ Institute user: ${username}  (id=${inst.institute_id})  pwd: institute123`);
    }

    // -- Industry users --
    const industryRepo2 = ds.getRepository('master_industry');
    const allIndustries = await industryRepo2.find() as any[];
    let indUsersCreated = 0;
    for (const ind of allIndustries) {
        const linked = await userRepo.findOne({ where: { industry_id: ind.industry_id } } as any);
        if (linked) continue;

        const slug = (ind.industry_name)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .substring(0, 20);
        const username = `ind_${slug}`;
        const email = ind.emailId ?? `${slug}@industry.in`;

        const existsByName = await userRepo.findOne({ where: { username } } as any);
        if (existsByName) continue;

        await userRepo.save({
            username,
            email,
            password_hash: indPwd,
            role: 'industry',
            institute_id: null,
            industry_id: ind.industry_id,
            is_active: 'Y',
            created_date: now,
        });
        indUsersCreated++;
        console.log(`✅ Industry user: ${username}  (id=${ind.industry_id})  pwd: industry123`);
    }

    console.log(`\n📋 Users created → Institute: ${instUsersCreated}  |  Industry: ${indUsersCreated}`);

    await ds.destroy();
    console.log(`\n🎉 Demo seed complete! Institutes: ${savedInstitutes.length} | Industries added: ${industryCount}`);
}

run().catch(err => {
    console.error('❌ Demo seed failed:', err.message);
    console.error('Detail:', err.detail ?? '');
    console.error('Table:', err.table ?? '');
    console.error('Constraint:', err.constraint ?? '');
    process.exit(1);
});
