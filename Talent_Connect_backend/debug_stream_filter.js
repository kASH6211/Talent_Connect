const { Client } = require('pg');
const c = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'root', database: 'talent_connect_harmeet' });
c.connect().then(async () => {
    // 1. Check what stream_branch_Id values exist in mapping_institute_qualification
    const r1 = await c.query(`
    SELECT "stream_branch_Id", COUNT(*) cnt
    FROM mapping_institute_qualification
    WHERE "stream_branch_Id" IS NOT NULL AND is_active = 'Y'
    GROUP BY "stream_branch_Id"
    ORDER BY cnt DESC LIMIT 10
  `);
    console.log('\n=== stream_branch_Id values in mapping_institute_qualification (active) ===');
    r1.rows.forEach(r => console.log(`  stream_branch_Id=${r.stream_branch_Id} → ${r.cnt} institutes`));

    // 2. Sample full rows
    const r2 = await c.query(`
    SELECT miq."instituteId", miq.qualificationid, miq."stream_branch_Id", miq.is_active,
           mi.institute_name, msb.stream_branch_name
    FROM mapping_institute_qualification miq
    LEFT JOIN master_institute mi ON mi.institute_id = miq."instituteId"
    LEFT JOIN master_stream_branch msb ON msb."stream_branch_Id" = miq."stream_branch_Id"
    WHERE miq."stream_branch_Id" IS NOT NULL
    LIMIT 5
  `);
    console.log('\n=== Sample rows with stream ===');
    r2.rows.forEach(r => console.log(JSON.stringify(r)));

    // 3. Check if stream branches in the dropdown (from master_stream_branch) have qualificationid
    const r3 = await c.query(`
    SELECT stream_branch_Id, stream_branch_name, qualificationid FROM master_stream_branch
    WHERE qualificationid IS NOT NULL LIMIT 5
  `);
    console.log('\n=== Stream branches with qualificationid ===');
    r3.rows.forEach(r => console.log(JSON.stringify(r)));

    // 4. Total active rows with or without stream
    const r4 = await c.query(`SELECT COUNT(*) FROM mapping_institute_qualification WHERE is_active='Y'`);
    const r5 = await c.query(`SELECT COUNT(*) FROM mapping_institute_qualification WHERE is_active='Y' AND "stream_branch_Id" IS NOT NULL`);
    console.log(`\nTotal active rows: ${r4.rows[0].count}`);
    console.log(`Active rows with stream_branch_Id: ${r5.rows[0].count}`);

    c.end();
}).catch(e => { console.error(e.message); c.end(); });
