const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'hospital_db'
    });

    console.log("Connected to DB. Creating Invoices table...");
    await db.query(`
        CREATE TABLE IF NOT EXISTS Invoices (
            id INT AUTO_INCREMENT PRIMARY KEY,
            patient_id INT,
            appointment_id INT,
            amount DECIMAL(10, 2) NOT NULL DEFAULT 150.00,
            status ENUM('Unpaid', 'Paid') DEFAULT 'Unpaid',
            issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES Patients(id) ON DELETE CASCADE,
            FOREIGN KEY (appointment_id) REFERENCES Appointments(id) ON DELETE CASCADE
        )
    `);

    console.log("Migration successful! Invoices database table securely deployed.");
    process.exit(0);
}

migrate();
