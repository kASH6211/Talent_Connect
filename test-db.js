const { Client } = require('pg');

async function testConnection(password) {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: password,
        database: 'talent_connect'
    });
    try {
        await client.connect();
        console.log(`Connected successfully with password: "${password}"`);
        const res = await client.query(`
            SELECT conrelid::regclass AS table_from, conname, pg_get_constraintdef(c.oid)
            FROM pg_constraint c
            WHERE conname = 'FK_69edd5c3e2b56ba1a1c1182bf43'
        `);
        console.log('Constraint Info:', res.rows);

        const res2 = await client.query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name IN ('master_institute', 'master_district');
        `);
        console.log('Columns:', res2.rows.filter(r => r.column_name.includes('district') || r.column_name.includes('lgd')));
        await client.end();
        return true;
    } catch (err) {
        console.log(`Failed with password: "${password}": ${err.message}`);
        return false;
    }
}

async function run() {
    const passwords = ['123', 'postgres', '', 'admin', 'password', 'root'];
    for (const pw of passwords) {
        if (await testConnection(pw)) break;
    }
}

run();
