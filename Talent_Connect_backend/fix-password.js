const bcrypt = require('bcryptjs');
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
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // First, check if we have any users, if not, create an admin user
        const res = await client.query('SELECT * FROM users LIMIT 1');
        if (res.rows.length === 0) {
            await client.query(
                'INSERT INTO users (username, email, password_hash, role, is_active) VALUES ($1, $2, $3, $4, $5)',
                ['admin', 'admin@example.com', hashedPassword, 'admin', 'Y']
            );
            console.log('Created new admin user with username: admin, password: password123');
        } else {
            const user = res.rows[0];
            await client.query(
                'UPDATE users SET password_hash = $1 WHERE id = $2',
                [hashedPassword, user.id]
            );
            console.log(`Updated user ${user.username} with new password: password123`);
        }
    } catch (e) {
        console.log('ERROR:', e.message);
    }

    await client.end();
}
run();
