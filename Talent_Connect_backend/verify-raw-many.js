const { DataSource } = require('typeorm');
require('reflect-metadata');
const fs = require('fs');

async function checkRawManyKeys() {
    const ds = new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'root',
        database: 'talent_connect_harmeet',
        entities: [],
    });

    try {
        await ds.initialize();

        const alias = 'i';
        const qb = ds.createQueryBuilder()
            .from('master_institute', alias)
            .where(`${alias}.is_active = 'Y'`)
            .select([
                'i.institute_id AS institute_id'
            ])
            .addSelect(`(
                SELECT COALESCE(SUM(sc.studentcount), 0)
                FROM student_count sc
                JOIN mapping_institute_qualification miq ON sc.institute_qualification_id = miq.institute_qualification_id
                WHERE miq."instituteId" = i.institute_id
            )`, 'student_count')
            .limit(1);

        const rows = await qb.getRawMany();
        console.log('--- Raw Many Keys ---');
        console.log(JSON.stringify(rows[0], null, 2));
        fs.writeFileSync('../raw_many_keys.json', JSON.stringify(rows[0], null, 2));

        await ds.destroy();
    } catch (err) {
        console.error('Failed to get raw many:', err.message);
    }
}

checkRawManyKeys();
