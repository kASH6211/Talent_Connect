/**
 * Talent Connect – Master Session Seeder
 * Run: npx ts-node -r tsconfig-paths/register src/database/seeds/seed-sessions.ts
 */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { MasterSession } from '../../modules/master-session/master-session.entity';

dotenv.config({ path: `.env` });

const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'talent_connect',
    entities: [MasterSession],
    synchronize: false,
});

const now = new Date().toISOString();

async function seed() {
    await ds.initialize();
    console.log('🌱 Database connected. Seeding Master Sessions...\n');

    const repo = ds.getRepository(MasterSession);
    const count = await repo.count();
    console.log(`Current record count: ${count}`);

    if (count === 0) {
        await repo.save([
            { session: '2023-24', is_active: 'Y', created_date: now, createdby: 'seed' },
            { session: '2024-25', is_active: 'Y', created_date: now, createdby: 'seed' },
            { session: '2025-26', is_active: 'Y', created_date: now, createdby: 'seed' },
        ]);
        console.log('✅ Master Sessions seeded');
    } else {
        const existing = await repo.find();
        console.log('⏭  Master Sessions already exist:', existing);
    }

    await ds.destroy();
}

seed().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
