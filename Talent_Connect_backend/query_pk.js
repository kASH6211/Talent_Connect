const { Client } = require('pg');
const client = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'root', database: 'talent_connect_harmeet' });
client.connect().then(() => {
    return client.query(`SELECT conrelid::regclass AS table_name FROM pg_constraint WHERE conname = 'PK_237961b17dfd63d2bc5ce0660ee'`);
}).then(res => {
    console.log('TABLE:', res.rows[0]?.table_name);
    client.end();
});
