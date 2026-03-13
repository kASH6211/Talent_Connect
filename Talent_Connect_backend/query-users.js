const { Client } = require('pg');

async function queryUsers() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: '123',
        database: 'talent_connect_new1'
    });
    try {
        await client.connect();
        await client.query("UPDATE \"users\" SET is_passwordchanged = 'N' WHERE username = 'institutelgd'");
        const res = await client.query('SELECT id, username, email, is_passwordchanged FROM "users"');
        console.log('Users Data (institutelgd should be N):');
        console.table(res.rows);
        await client.end();
    } catch (err) {
        console.error('Error querying users:', err.message);
    }
}

queryUsers();
