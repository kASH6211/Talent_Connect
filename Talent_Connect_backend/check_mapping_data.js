const { Client } = require('pg');
const c = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'root', database: 'talent_connect_harmeet' });
c.connect().then(async () => {
    const r1 = await c.query('SELECT COUNT(*) FROM mapping_institute_qualification');
    console.log('mapping_institute_qualification rows:', r1.rows[0].count);

    const r2 = await c.query('SELECT COUNT(*) FROM mapping_institute_qualification WHERE "stream_branch_Id" IS NOT NULL');
    console.log('mapping_institute_qualification rows with stream_branch_Id:', r2.rows[0].count);

    const r3 = await c.query('SELECT COUNT(*) FROM mapping_institute_program WHERE "stream_branch_Id" IS NOT NULL');
    console.log('mapping_institute_program rows with stream_branch_Id:', r3.rows[0].count);

    const r4 = await c.query('SELECT COUNT(*) FROM master_stream_branch WHERE qualificationid IS NOT NULL');
    console.log('master_stream_branch rows with qualificationid:', r4.rows[0].count);

    const r5 = await c.query(`SELECT DISTINCT mip."instituteId", mip."stream_branch_Id" FROM mapping_institute_program mip WHERE mip."stream_branch_Id" = 3 AND mip.is_active = 'Y' LIMIT 5`);
    console.log('Institutes with stream_branch_Id=3 in mapping_institute_program:', r5.rows.length);

    const r6 = await c.query('SELECT qualificationid, COUNT(*) cnt FROM mapping_institute_qualification GROUP BY qualificationid ORDER BY cnt DESC LIMIT 5');
    console.log('Qual distribution in mapping_institute_qualification:', r6.rows);

    c.end();
}).catch(e => { console.error(e.message); c.end(); });
