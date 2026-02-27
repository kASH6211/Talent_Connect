const { Client } = require('pg');
const c = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'root', database: 'talent_connect_harmeet' });
c.connect().then(async () => {
    // Check if table exists
    const tableCheck = await c.query(`SELECT table_name FROM information_schema.tables WHERE table_name IN ('mapping_institute_qualification', 'institute_qualification_mapping')`);
    console.log('Existing tables:', tableCheck.rows.map(r => r.table_name));

    // Create the table if it doesn't exist
    await c.query(`
    CREATE TABLE IF NOT EXISTS mapping_institute_qualification (
      institute_qualification_id SERIAL PRIMARY KEY,
      "instituteId" integer NOT NULL,
      qualificationid integer NOT NULL,
      is_active char(1) DEFAULT 'Y',
      created_date timestamp DEFAULT now(),
      modified_date timestamp DEFAULT now(),
      CONSTRAINT fk_iq_institute FOREIGN KEY ("instituteId") REFERENCES master_institute(institute_id) ON DELETE CASCADE,
      CONSTRAINT fk_iq_qualification FOREIGN KEY (qualificationid) REFERENCES master_qualification(qualificationid) ON DELETE CASCADE,
      CONSTRAINT uq_institute_qualification UNIQUE ("instituteId", qualificationid)
    )
  `);
    console.log('✔ mapping_institute_qualification table created/confirmed');

    const count = await c.query('SELECT COUNT(*) FROM mapping_institute_qualification');
    console.log('Row count:', count.rows[0].count);
    c.end();
}).catch(e => { console.error('Error:', e.message); c.end(); });
