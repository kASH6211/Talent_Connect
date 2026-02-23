import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const ds = new DataSource({
    type: 'postgres', host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'talent_connect',
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: false,
});

ds.initialize().then(async () => {
    const users = await ds.query(`
        SELECT u.id, u.role, u.username, u.email,
               i.institute_name, ind.industry_name
        FROM users u
        LEFT JOIN master_institute i ON i.institute_id = u.institute_id
        LEFT JOIN master_industry ind ON ind.industry_id = u.industry_id
        ORDER BY u.role, u.username
    `);
    console.log('\n=== All Users ===');
    console.log(`${'Role'.padEnd(12)} ${'Username'.padEnd(28)} ${'Email'.padEnd(36)} Linked To`);
    console.log('-'.repeat(110));
    for (const u of users) {
        const linked = u.institute_name ?? u.industry_name ?? '(admin)';
        console.log(`${u.role.padEnd(12)} ${u.username.padEnd(28)} ${u.email.padEnd(36)} ${linked}`);
    }
    console.log(`\nTotal: ${users.length} users`);
    await ds.destroy();
});
