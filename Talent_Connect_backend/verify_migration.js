const { Client } = require('pg');
const c = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'root', database: 'talent_connect_harmeet' });
c.connect().then(async () => {
    const r1 = await c.query('SELECT COUNT(*) FROM master_stream_branch WHERE qualificationid IS NOT NULL');
    console.log('master_stream_branch with qualificationid filled:', r1.rows[0].count);

    const r2 = await c.query('SELECT * FROM mapping_stream_branch_qualification LIMIT 2');
    console.log('mapping sample:', JSON.stringify(r2.rows));

    const r3 = await c.query("SELECT column_name FROM information_schema.columns WHERE table_name='mapping_stream_branch_qualification' ORDER BY ordinal_position");
    console.log('mapping cols:', r3.rows.map(r => r.column_name));

    const r4 = await c.query("SELECT constraint_name, constraint_type FROM information_schema.table_constraints WHERE table_name='mapping_stream_branch_qualification'");
    console.log('constraints:', JSON.stringify(r4.rows));

    c.end();
}).catch(e => { console.error(e.message); c.end(); });
