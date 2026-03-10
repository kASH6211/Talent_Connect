const { Client } = require('pg');

async function testQuery() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'root',
        database: 'talent_connect_harmeet'
    });

    try {
        await client.connect();

        const sql = `
            SELECT 
                i.institute_id AS institute_id,
                i.institute_name,
                (
                  SELECT COALESCE(SUM(sc.studentcount), 0)
                  FROM student_count sc
                  JOIN mapping_institute_qualification miq ON sc.institute_qualification_id = miq.institute_qualification_id
                  WHERE miq."instituteId" = i.institute_id
                ) AS student_count
            FROM master_institute i
            WHERE i.is_active = 'Y'
            ORDER BY i.institute_id ASC
            LIMIT 5
        `;

        const res = await client.query(sql);
        console.log('--- Exact Query Test Results ---');
        console.log(JSON.stringify(res.rows, null, 2));

        await client.end();
    } catch (err) {
        console.error('Test failed:', err.message);
    }
}

testQuery();
