/**
 * Talent Connect – Master NSQF Seeder
 * Run: npx ts-node -r tsconfig-paths/register src/database/seeds/seed-nsqf.ts
 */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { MasterNsqf } from '../../modules/master-nsqf/master-nsqf.entity';

dotenv.config({ path: `.env` });

const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'talent_connect_harmeet',
    entities: [MasterNsqf],
    synchronize: true, // Allow sync to apply column type change
});

const now = new Date().toISOString();

async function seed() {
    await ds.initialize();
    console.log('🌱 Database connected. Seeding Master NSQF Levels...\n');

    const repo = ds.getRepository(MasterNsqf);

    // Clear and re-seed to ensure correct scale in existing data
    await repo.clear();

    await repo.save([
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

    await ds.destroy();
}

seed().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
