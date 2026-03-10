const { DataSource } = require('typeorm');
require('reflect-metadata');
const fs = require('fs');

async function checkFullMapping() {
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
                'i.institute_id              AS institute_id',
                'i.institute_name            AS institute_name',
                'i."emailId"                 AS email',
                'i.mobileno                  AS mobileno',
                'i.institute_type_id         AS type_id',
                'i.institute_ownership_type_id AS ownership_id',
            ])
            .addSelect(`(
                SELECT COALESCE(SUM(sc.studentcount), 0)
                FROM student_count sc
                JOIN mapping_institute_qualification miq ON sc.institute_qualification_id = miq.institute_qualification_id
                WHERE miq."instituteId" = i.institute_id
            )`, 'student_count')
            .limit(1);

        const rows = await qb.getRawMany();
        console.log('--- Full Raw Row Keys ---');
        console.log(Object.keys(rows[0]));
        console.log('--- Full Raw Row Values ---');
        console.log(JSON.stringify(rows[0], null, 2));

        await ds.destroy();
    } catch (err) {
        console.error('Failed:', err.message);
    }
}

checkFullMapping();
