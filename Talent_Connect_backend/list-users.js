const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'talent_connect_new1',
    password: '123',
    port: 5432,
});

async function run() {
    await client.connect();
    try {
        let res = await client.query(`SELECT id, username, email, role FROM users ORDER BY id ASC LIMIT 5`);
        fs.writeFileSync('users.json', JSON.stringify(res.rows, null, 2));
        console.log('Saved to users.json');
    } catch (e) {
        console.log('ERROR:', e.message);
    }

    await client.end();
}
run();
