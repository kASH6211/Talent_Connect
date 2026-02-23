const { Client } = require('pg');

async function testConnection(password) {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: password,
        database: 'postgres'
    });
    try {
        await client.connect();
        console.log(`Connected successfully with password: "${password}"`);
        const res = await client.query('SELECT datname FROM pg_database');
        console.log('Databases:', res.rows.map(r => r.datname).join(', '));
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
