const { Client } = require('pg');
const client = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'root', database: 'talent_connect_harmeet' });
client.connect().then(async () => {
    const res1 = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'mapping_stream_branch_qualification' ORDER BY ordinal_position");
    console.log('\n=== mapping_stream_branch_qualification columns ===');
    res1.rows.forEach(r => console.log(r.column_name, ':', r.data_type));

    const res2 = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'master_stream_branch' ORDER BY ordinal_position");
    console.log('\n=== master_stream_branch columns ===');
    res2.rows.forEach(r => console.log(r.column_name, ':', r.data_type));

    const res3 = await client.query("SELECT constraint_name, constraint_type FROM information_schema.table_constraints WHERE table_name = 'mapping_stream_branch_qualification'");
    console.log('\n=== mapping_stream_branch_qualification constraints ===');
    res3.rows.forEach(r => console.log(r.constraint_name, ':', r.constraint_type));

    const sample = await client.query('SELECT * FROM mapping_stream_branch_qualification LIMIT 5');
    console.log('\n=== sample mapping rows ===');
    sample.rows.forEach(r => console.log(JSON.stringify(r)));

    const count = await client.query('SELECT COUNT(*) FROM mapping_stream_branch_qualification');
    console.log('\nTotal rows in mapping:', count.rows[0].count);

    client.end();
}).catch(e => console.error(e.message));
