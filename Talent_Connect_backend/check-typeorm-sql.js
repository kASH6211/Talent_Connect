const { DataSource } = require('typeorm');
require('reflect-metadata');
const fs = require('fs');

async function checkTypeOrmSql() {
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
                'i.institute_id AS institute_id',
                'i.institute_name AS institute_name'
            ])
            .addSelect(`(
                SELECT COALESCE(SUM(sc.studentcount), 0)
                FROM student_count sc
                JOIN mapping_institute_qualification miq ON sc.institute_qualification_id = miq.institute_qualification_id
                WHERE miq."instituteId" = i.institute_id
            )`, 'student_count')
            .limit(5);

        const sql = qb.getSql();
        fs.writeFileSync('../typeorm_generated_sql.txt', sql);
        console.log('Generated SQL written to typeorm_generated_sql.txt');

        await ds.destroy();
    } catch (err) {
        console.error('Failed to generate SQL:', err.message);
    }
}

checkTypeOrmSql();
