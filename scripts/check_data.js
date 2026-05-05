const db = require('./db');

async function checkDatabase() {
    try {
        const [users] = await db.query('SELECT * FROM Users');
        console.log('=== USERS TABLE ===\n', JSON.stringify(users, null, 2));
    } catch (err) {
        console.error('Users error:', err.message);
    }
    
    try {
        const [patients] = await db.query('SELECT * FROM Patients');
        console.log('\n=== PATIENTS TABLE ===\n', JSON.stringify(patients, null, 2));
    } catch (err) {
        console.error('Patients error:', err.message);
    }
    process.exit();
}

checkDatabase();
