const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function check() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'hospital_db'
    });

    const [docs] = await db.query('SELECT u.username, d.id, d.full_name as name, d.specialty, d.experience_years, d.phone FROM Doctors d JOIN Users u ON d.user_id = u.id');
    fs.writeFileSync('data.json', JSON.stringify(docs, null, 2));
    process.exit(0);
}
check();
