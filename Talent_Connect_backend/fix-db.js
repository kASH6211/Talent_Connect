const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'talent_connect_new1',
    password: '123',
    port: 5432,
});

async function run() {
    await client.connect();
    console.log('Connected to DB');
    try {
        let res = await client.query(`
      UPDATE mapping_institute_qualification 
      SET "stream_branch_Id" = NULL
      WHERE "stream_branch_Id" IS NOT NULL AND "stream_branch_Id" NOT IN (SELECT "stream_branch_Id" FROM master_stream_branch)
    `);
        console.log(`Updated ${res.rowCount} orphaned stream_branch_Id records in mapping_institute_qualification`);
    } catch (e) {
        console.log('ERROR:', e.message);
    }

    await client.end();
}
run();
