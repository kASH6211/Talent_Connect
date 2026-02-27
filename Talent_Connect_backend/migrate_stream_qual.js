const { Client } = require('pg');
const client = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'root', database: 'talent_connect_harmeet' });

client.connect().then(async () => {
    console.log('Connected to DB...');

    // Step 1: Add qualificationid column to master_stream_branch if not exists
    try {
        await client.query(`ALTER TABLE master_stream_branch ADD COLUMN IF NOT EXISTS qualificationid integer`);
        console.log('✔ Added qualificationid column to master_stream_branch');
    } catch (e) {
        console.log('Column already exists or error:', e.message);
    }

    // Step 2: Update qualificationid in master_stream_branch using the mapping table
    const updateRes = await client.query(`
    UPDATE master_stream_branch msb
    SET qualificationid = msq.qualificationid
    FROM mapping_stream_branch_qualification msq
    WHERE msb."stream_branch_Id" = msq."stream_branch_Id"
  `);
    console.log(`✔ Updated ${updateRes.rowCount} rows in master_stream_branch with qualificationid`);

    // Step 3: Check if stream_branch_qualification_id column exists in mapping table
    const colCheck = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'mapping_stream_branch_qualification'
    AND column_name = 'stream_branch_qualification_id'
  `);

    if (colCheck.rows.length === 0) {
        // Add the primary key column with auto-increment
        await client.query(`ALTER TABLE mapping_stream_branch_qualification ADD COLUMN stream_branch_qualification_id SERIAL`);
        console.log('✔ Added stream_branch_qualification_id column');
    } else {
        console.log('ℹ stream_branch_qualification_id column already exists');
    }

    // Step 4: Drop any existing PK constraints and add PK on stream_branch_qualification_id
    const pkCheck = await client.query(`
    SELECT constraint_name FROM information_schema.table_constraints
    WHERE table_name = 'mapping_stream_branch_qualification' AND constraint_type = 'PRIMARY KEY'
  `);

    for (const row of pkCheck.rows) {
        await client.query(`ALTER TABLE mapping_stream_branch_qualification DROP CONSTRAINT "${row.constraint_name}"`);
        console.log(`✔ Dropped existing PK: ${row.constraint_name}`);
    }

    await client.query(`ALTER TABLE mapping_stream_branch_qualification ADD PRIMARY KEY (stream_branch_qualification_id)`);
    console.log('✔ Added PRIMARY KEY constraint on stream_branch_qualification_id');

    // Verify
    console.log('\n=== Verification ===');
    const verify1 = await client.query('SELECT stream_branch_Id, qualificationid FROM master_stream_branch WHERE qualificationid IS NOT NULL LIMIT 5');
    console.log('master_stream_branch with qualificationid:');
    verify1.rows.forEach(r => console.log(JSON.stringify(r)));

    const verify2 = await client.query('SELECT * FROM mapping_stream_branch_qualification LIMIT 3');
    console.log('\nmapping_stream_branch_qualification sample:');
    verify2.rows.forEach(r => console.log(JSON.stringify(r)));

    const nullCount = await client.query('SELECT COUNT(*) FROM master_stream_branch WHERE qualificationid IS NULL');
    console.log(`\nRows without qualificationid in master_stream_branch: ${nullCount.rows[0].count}`);

    await client.end();
}).catch(e => { console.error('Error:', e.message); client.end(); });
