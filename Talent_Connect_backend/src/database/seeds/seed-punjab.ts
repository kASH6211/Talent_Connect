import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { District } from '../../modules/district/district.entity';
import { State } from '../../modules/state/state.entity';

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

async function run() {
    await ds.initialize();
    console.log('🌱 Connected. Seeding Punjab districts...');

    const stateRepo = ds.getRepository(State);
    const distRepo = ds.getRepository(District);

    const punjab = await stateRepo.findOne({ where: { statename: 'Punjab' } as any });
    if (!punjab) {
        console.error('❌ Punjab state not found!');
        process.exit(1);
    }

    const districts = [
        { districtname: 'Amritsar', lgdstateid: punjab.lgdstateid, lgddistrictId: 30 }, // Dummy lgd
        { districtname: 'Ludhiana', lgdstateid: punjab.lgdstateid, lgddistrictId: 31 },
        { districtname: 'Jalandhar', lgdstateid: punjab.lgdstateid, lgddistrictId: 32 },
        { districtname: 'Patiala', lgdstateid: punjab.lgdstateid, lgddistrictId: 33 },
        { districtname: 'Bathinda', lgdstateid: punjab.lgdstateid, lgddistrictId: 34 },
        { districtname: 'Mohali (SAS Nagar)', lgdstateid: punjab.lgdstateid, lgddistrictId: 35 },
        { districtname: 'Hoshiarpur', lgdstateid: punjab.lgdstateid, lgddistrictId: 36 },
        { districtname: 'Gurdaspur', lgdstateid: punjab.lgdstateid, lgddistrictId: 37 },
        { districtname: 'Pathankot', lgdstateid: punjab.lgdstateid, lgddistrictId: 38 },
        { districtname: 'Sangrur', lgdstateid: punjab.lgdstateid, lgddistrictId: 39 },
    ];

    for (const d of districts) {
        const exists = await distRepo.findOne({ where: { districtname: d.districtname } as any });
        if (!exists) {
            await distRepo.save({
                ...d,
                is_active: 'Y',
                created_date: new Date().toISOString(),
                createdby: 'seed-punjab',
            });
            console.log(`✅ Added ${d.districtname}`);
        } else {
            console.log(`⏭  ${d.districtname} already exists`);
        }
    }

    await ds.destroy();
}

run().catch(console.error);
