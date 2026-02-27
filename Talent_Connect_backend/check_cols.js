const { Client } = require('pg');
const c = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'root', database: 'talent_connect_harmeet' });
c.connect().then(async () => {
    const r = await c.query("SELECT column_name FROM information_schema.columns WHERE table_name='mapping_institute_qualification' ORDER BY ordinal_position");
    console.log('Columns:', r.rows.map(x => x.column_name));
    // Try querying with lowercase
    try {
        const r2 = await c.query('SELECT * FROM mapping_institute_qualification LIMIT 2');
        console.log('Sample row:', JSON.stringify(r2.rows[0]));
    } catch (e) { console.error(e.message); }
    c.end();
}).catch(e => { console.error(e.message); c.end(); });
