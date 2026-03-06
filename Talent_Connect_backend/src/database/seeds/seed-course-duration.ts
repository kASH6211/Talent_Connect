/**
 * Talent Connect – Master Course Duration Seeder
 * Run: npx ts-node -r tsconfig-paths/register src/database/seeds/seed-course-duration.ts
 */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { MasterCourseDuration } from '../../modules/master-course-duration/master-course-duration.entity';

dotenv.config({ path: `.env` });

const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'talent_connect_harmeet',
    entities: [MasterCourseDuration],
    synchronize: true,
});

const now = new Date().toISOString();

async function seed() {
    await ds.initialize();
    console.log('🌱 Database connected. Seeding Master Course Durations...\n');

    const repo = ds.getRepository(MasterCourseDuration);

    if ((await repo.count()) === 0) {
        await repo.save([
            { courseduration: '6 Months', is_active: 'Y', created_date: now, createdby: 'seed' },
            { courseduration: '1 Year', is_active: 'Y', created_date: now, createdby: 'seed' },
            { courseduration: '2 Years', is_active: 'Y', created_date: now, createdby: 'seed' },
            { courseduration: '3 Years', is_active: 'Y', created_date: now, createdby: 'seed' },
            { courseduration: '4 Years', is_active: 'Y', created_date: now, createdby: 'seed' },
        ]);
        console.log('✅ Master Course Durations seeded');
    } else {
        console.log('⏭  Master Course Durations already exist');
    }

    await ds.destroy();
}

seed().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
