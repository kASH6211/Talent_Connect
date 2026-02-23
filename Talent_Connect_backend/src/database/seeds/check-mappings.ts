
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { ProgramQualificationMapping } from '../../modules/program-qualification-mapping/program-qualification-mapping.entity';

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
    console.log('🌱 Connected. Checking Program-Qualification Mappings...');

    const repo = ds.getRepository(ProgramQualificationMapping);
    const count = await repo.count();
    console.log(`Total Mappings: ${count}`);

    if (count > 0) {
        const samples = await repo.find({ relations: ['program', 'qualification'], take: 5 });
        console.log('Sample Mappings:', samples);
    } else {
        console.log('❌ No mappings found!');
    }

    await ds.destroy();
}

run().catch(console.error);
