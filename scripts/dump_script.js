const fs = require('fs');
const db = require('./db');
async function dump() {
    const [users] = await db.query('SELECT username, role FROM Users');
    const [patients] = await db.query('SELECT full_name, dob, gender, phone FROM Patients');
    fs.writeFileSync('db_dump.json', JSON.stringify({users, patients}, null, 2));
    process.exit();
}
dump();
