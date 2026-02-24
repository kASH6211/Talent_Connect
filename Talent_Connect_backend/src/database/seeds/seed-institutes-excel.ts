/**
 * Talent Connect – Institute Seeder from Excel
 * Reads: src/database/seeds/Final Institute Master.xlsx
 * Upserts: master_institute (165 rows)
 *
 * Run:
 *   npx ts-node -r tsconfig-paths/register src/database/seeds/seed-institutes-excel.ts
 */
import 'reflect-metadata';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

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

// ─── helpers ───────────────────────────────────────────────────────────────────

const str = (v: any): string | null => (v != null && String(v).trim() !== '' ? String(v).trim() : null);
const num = (v: any): number | null => {
    if (v == null) return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
};

/** Parse latitude/longitude – can be a raw number or a DMS string like "31.6706'N" */
const parseCoord = (v: any): string | null => {
    if (v == null) return null;
    const s = String(v).trim();
    if (!s) return null;
    // Already a clean number
    if (!isNaN(Number(s))) return String(Number(s));
    // Strip DMS suffix (N, S, E, W, ., ') and return numeric part
    const m = s.match(/[\d.]+/);
    return m ? m[0] : null;
};

const yn = (v: any): string => {
    if (v == null) return 'N';
    const s = String(v).trim().toLowerCase();
    return s === 'yes' || s === 'y' ? 'Y' : 'N';
};

/** Urban → U, Rural → R, otherwise first char */
const ruralUrban = (v: any): string | null => {
    if (v == null) return null;
    const s = String(v).trim().toLowerCase();
    if (s.startsWith('u')) return 'U';
    if (s.startsWith('r')) return 'R';
    return s.charAt(0).toUpperCase() || null;
};

/** Fuzzy-match a name against a list */
function fuzzy<T>(list: T[], getKey: (t: T) => string, needle: string): T | undefined {
    if (!needle) return undefined;
    const n = needle.toLowerCase().trim();
    // exact
    let hit = list.find(t => getKey(t).toLowerCase().trim() === n);
    if (hit) return hit;
    // starts-with
    hit = list.find(t => getKey(t).toLowerCase().trim().startsWith(n) || n.startsWith(getKey(t).toLowerCase().trim()));
    if (hit) return hit;
    // contains
    hit = list.find(t => getKey(t).toLowerCase().includes(n) || n.includes(getKey(t).toLowerCase()));
    return hit;
}

// ─── main ──────────────────────────────────────────────────────────────────────

async function run() {
    await ds.initialize();
    console.log('🌱 Connected to DB\n');

    // ── Load master lookup tables ─────────────────────────────────────────────
    const districts = await ds.getRepository('master_district').find() as any[];
    const states = await ds.getRepository('master_state').find() as any[];
    const types = await ds.getRepository('master_institute_type').find() as any[];
    const subTypes = await ds.getRepository('master_institute_sub_type').find() as any[];
    const ownerships = await ds.getRepository('master_institute_ownership_type').find() as any[];
    const affiliations = await ds.getRepository('master_affiliation_body').find() as any[];
    const regulatories = await ds.getRepository('master_regulatory_body').find() as any[];
    const enrollments = await ds.getRepository('master_institute_enrollment').find() as any[];

    console.log(`📋 Lookup: ${districts.length} districts, ${types.length} types, ${ownerships.length} ownerships`);

    const districtId = (name: string) => fuzzy(districts, d => d.districtname, name)?.districtid ?? null;
    const stateId = (name: string) => fuzzy(states, s => s.statename, name)?.stateid ?? null;
    const typeId = (name: string) => fuzzy(types, t => t.institute_type ?? '', name)?.institute_type_id ?? null;
    const subTypeId = (name: string) => fuzzy(subTypes, t => t.institute_sub_type ?? '', name)?.institute_sub_type_id ?? null;
    const ownId = (name: string) => fuzzy(ownerships, o => o.institute_type ?? '', name)?.institute_ownership_type_id ?? null;
    const affiliId = (name: string) => fuzzy(affiliations, a => a.affiliating_body ?? '', name)?.affiliating_body_id ?? null;
    const regulId = (name: string) => fuzzy(regulatories, r => r.regulatory_body ?? '', name)?.regulatory_body_id ?? null;
    const enrollId = (name: string) => fuzzy(enrollments, e => e.instituteenrollmenttype ?? '', name)?.institute_enrollment_id ?? null;

    // ── Read Excel ────────────────────────────────────────────────────────────
    const excelPath = path.join(__dirname, 'Final Institute Master.xlsx');
    const wb = XLSX.readFile(excelPath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: null });

    console.log(`📁 Excel rows: ${rows.length}\n`);

    const repo = ds.getRepository('master_institute');
    const now = new Date().toISOString();
    const base = { is_active: 'Y', created_date: now, createdby: 'seed-excel' };

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const r of rows) {
        const name = str(r['institute_name']);
        if (!name) { skipped++; continue; }

        const regId = str(r['institute_registration_id']);

        // Build the row payload
        const payload: Record<string, any> = {
            institute_name: name,
            institute_registration_id: regId,
            institute_abbreviation: str(r['institute_abbreviation']),
            year_of_establishment: num(r['year_of_establishment']),
            lgdstateId: stateId(str(r['lgdstateId']) ?? ''),
            lgddistrictId: districtId(str(r['lgddistrictId']) ?? ''),
            institute_type_id: typeId(str(r['institute_type_id']) ?? ''),
            institute_sub_type_id: subTypeId(str(r['institute_sub_type_id']) ?? ''),
            institute_ownership_type_id: ownId(str(r['institute_ownership_type_id']) ?? ''),
            affiliating_body_id: affiliId(str(r['affiliating_body_id']) ?? ''),
            regulatory_body_id: regulId(str(r['regulatory_body_id']) ?? ''),
            institute_rural_urban_status: ruralUrban(r['institute_rural_urban_status']),
            address: str(r['address']),
            pincode: str(r['pincode']),
            phone: str(r['phone']),
            url: str(r['url']),
            emailId: str(r['emailId']),
            altemailId: str(r['altemailId']),
            contactperson: str(r['contactperson']),
            mobileno: str(r['mobileno']),
            institute_enrollment_id: enrollId(str(r['institute_enrollment_id']) ?? ''),
            totalseatIntake: num(r['totalseatIntake']),
            is_placement_cell_available: yn(r['is_placement_cell_available']),
            placement_officer_contact_number: str(r['placement_officer_contact_number']),
            placement_officer_email_id: str(r['placement_officer_email_id']),
            latitude: parseCoord(r['latitude']),
            longitude: parseCoord(r['longitude']),
        };

        // Upsert: try by registration_id first, then by name
        let existing: any = null;
        if (regId) {
            existing = await repo.findOne({ where: { institute_registration_id: regId } as any }).catch(() => null);
        }
        if (!existing) {
            existing = await repo.findOne({ where: { institute_name: name } as any }).catch(() => null);
        }

        if (existing) {
            await repo.update({ institute_id: existing.institute_id } as any, {
                ...payload,
                updated_date: now,
                updatedby: 'seed-excel',
            });
            updated++;
            console.log(`🔄 Updated  [${existing.institute_id}] ${name}`);
        } else {
            const saved = await repo.save({ ...payload, ...base });
            inserted++;
            console.log(`✅ Inserted [${saved.institute_id}] ${name}`);
        }
    }

    await ds.destroy();
    console.log(`\n🎉 Done!`);
    console.log(`   Inserted : ${inserted}`);
    console.log(`   Updated  : ${updated}`);
    console.log(`   Skipped  : ${skipped}`);
}

run().catch(err => {
    console.error('❌ Seed failed:', err.message);
    console.error('   Detail    :', err.detail ?? '');
    console.error('   Table     :', err.table ?? '');
    console.error('   Constraint:', err.constraint ?? '');
    process.exit(1);
});
