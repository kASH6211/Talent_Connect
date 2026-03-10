const { Client } = require('pg');

async function checkUser() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'talent_connect_harmeet',
    password: 'admin123',
    port: 5432,
  });

  try {
    await client.connect();
    
    // Check Job Offers for Industry ID 2
    const offers = await client.query('SELECT count(*) FROM industry_job_offer WHERE industry_id = 2');
    console.log(`Job Offers for Industry ID 2: ${offers.rows[0].count}`);
    
    if (offers.rows[0].count > 0) {
      const sample = await client.query('SELECT offer_id, industry_id, institute_id, status FROM industry_job_offer WHERE industry_id = 2 LIMIT 5');
      console.log('Sample Offers:');
      for (const row of sample.rows) {
        console.log(`OfferID: ${row.offer_id}, IndustryID: ${row.industry_id}, InstituteID: ${row.institute_id}, Status: ${row.status}`);
      }
    } else {
      const anyOffers = await client.query('SELECT count(*) FROM industry_job_offer');
      console.log(`Total Job Offers in DB: ${anyOffers.rows[0].count}`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkUser();
