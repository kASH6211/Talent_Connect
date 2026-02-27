const { Client } = require('pg');
const c = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'root', database: 'talent_connect_harmeet' });
c.connect().then(async () => {
    // Check if FK already exists
    const existing = await c.query(`
    SELECT constraint_name FROM information_schema.table_constraints
    WHERE table_name = 'master_stream_branch'
    AND constraint_type = 'FOREIGN KEY'
    AND constraint_name = 'fk_stream_branch_qualification'
  `);

    if (existing.rows.length > 0) {
        console.log('✔ FK constraint already exists');
    } else {
        // Nullify any qualificationid values that don't exist in master_qualification (to avoid constraint violation)
        const fixed = await c.query(`
      UPDATE master_stream_branch
      SET qualificationid = NULL
      WHERE qualificationid IS NOT NULL
      AND qualificationid NOT IN (SELECT qualificationid FROM master_qualification)
    `);
        console.log(`✔ Nullified ${fixed.rowCount} orphan qualificationid values`);

        // Add the foreign key constraint
        await c.query(`
      ALTER TABLE master_stream_branch
      ADD CONSTRAINT fk_stream_branch_qualification
      FOREIGN KEY (qualificationid)
      REFERENCES master_qualification(qualificationid)
      ON UPDATE CASCADE ON DELETE SET NULL
    `);
        console.log('✔ Added FK constraint: master_stream_branch.qualificationid -> master_qualification.qualificationid');
    }

    // Verify
    const verify = await c.query(`
    SELECT msb."stream_branch_Id", msb.stream_branch_name, msb.qualificationid, mq.qualification
    FROM master_stream_branch msb
    LEFT JOIN master_qualification mq ON msb.qualificationid = mq.qualificationid
    WHERE msb.qualificationid IS NOT NULL
    LIMIT 5
  `);
    console.log('\n=== Sample with qualification ===');
    verify.rows.forEach(r => console.log(JSON.stringify(r)));

    const nullCount = await c.query('SELECT COUNT(*) FROM master_stream_branch WHERE qualificationid IS NULL');
    const fillCount = await c.query('SELECT COUNT(*) FROM master_stream_branch WHERE qualificationid IS NOT NULL');
    console.log(`\nFilled: ${fillCount.rows[0].count} | NULL: ${nullCount.rows[0].count}`);

    c.end();
}).catch(e => { console.error('Error:', e.message); c.end(); });
