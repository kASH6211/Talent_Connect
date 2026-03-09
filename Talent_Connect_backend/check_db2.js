const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'talent_connect',
    password: 'root',
    port: 5432,
});

async function run() {
    await client.connect();
    const res = await client.query('SELECT offer_id, eoi_type, status FROM industry_job_offer ORDER BY offer_id DESC LIMIT 5');
    console.log(JSON.stringify(res.rows));
    await client.end();
}

run().catch(console.error);
