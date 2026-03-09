const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'talent_connect_harmeet',
  password: 'root',
  port: 5432,
});

async function run() {
  await client.connect();
  const res = await client.query('SELECT count(*) FROM industry_job_offer');
  console.log('COUNT:', res.rows[0].count);

  const tables = await client.query(`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'`);
  console.log('TABLES:', tables.rows.map(r => r.tablename).join(', '));
  await client.end();
}

run().catch(console.error);
