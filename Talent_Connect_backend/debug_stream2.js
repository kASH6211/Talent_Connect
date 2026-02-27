const { Client } = require('pg');
const c = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'root', database: 'talent_connect_harmeet' });
c.connect().then(async () => {
    // Check distinct stream_branch_Id values in the table
    const r1 = await c.query(`SELECT DISTINCT "stream_branch_Id" FROM mapping_institute_qualification WHERE "stream_branch_Id" IS NOT NULL AND is_active='Y'`);
    console.log('stream_branch_Id values in mapping_institute_qualification (is_active=Y):', r1.rows.map(r => r.stream_branch_Id));

    // Test the exact query used by the backend with the stream_branch_Id from user's working SQL
    const r2 = await c.query(`SELECT DISTINCT "instituteId" FROM mapping_institute_qualification WHERE is_active = 'Y' AND "stream_branch_Id" = ANY($1)`, [[118]]);
    console.log(`\nInstitutes with stream_branch_Id=118 (backend query):`, r2.rows.map(r => r.instituteId));

    // Also test without is_active filter
    const r3 = await c.query(`SELECT DISTINCT "instituteId" FROM mapping_institute_qualification WHERE "stream_branch_Id" = ANY($1)`, [[118]]);
    console.log(`Institutes with stream_branch_Id=118 (no is_active filter):`, r3.rows.map(r => r.instituteId));

    // Check is_active values for stream_branch_Id=118
    const r4 = await c.query(`SELECT "instituteId", is_active FROM mapping_institute_qualification WHERE "stream_branch_Id"=118`);
    console.log('\nRows with stream_branch_Id=118:');
    r4.rows.forEach(r => console.log(JSON.stringify(r)));

    c.end();
}).catch(e => { console.error(e.message); c.end(); });
