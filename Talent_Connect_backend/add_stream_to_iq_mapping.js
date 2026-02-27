const { Client } = require('pg');
const c = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'root', database: 'talent_connect_harmeet' });
c.connect().then(async () => {
    // Add stream_branch_Id column if not exists
    await c.query(`ALTER TABLE mapping_institute_qualification ADD COLUMN IF NOT EXISTS "stream_branch_Id" integer`);
    console.log('✔ Added stream_branch_Id column');

    // Add FK if not exists
    const fkCheck = await c.query(`
    SELECT constraint_name FROM information_schema.table_constraints
    WHERE table_name = 'mapping_institute_qualification' AND constraint_name = 'fk_iq_stream_branch'
  `);
    if (fkCheck.rows.length === 0) {
        await c.query(`
      ALTER TABLE mapping_institute_qualification
      ADD CONSTRAINT fk_iq_stream_branch
      FOREIGN KEY ("stream_branch_Id")
      REFERENCES master_stream_branch("stream_branch_Id")
      ON DELETE SET NULL
    `);
        console.log('✔ Added FK constraint for stream_branch_Id');
    } else {
        console.log('ℹ FK already exists');
    }

    // Show final columns
    const cols = await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'mapping_institute_qualification' ORDER BY ordinal_position`);
    console.log('\nFinal columns:');
    cols.rows.forEach(r => console.log(' -', r.column_name, ':', r.data_type));
    c.end();
}).catch(e => { console.error('Error:', e.message); c.end(); });
