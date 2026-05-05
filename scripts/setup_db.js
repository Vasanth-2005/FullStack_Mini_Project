const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
    try {
        console.log('Connecting to MySQL...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true
        });

        console.log('Cleaning old databases...');
        await connection.query('DROP DATABASE IF EXISTS hospital_db;');
        
        console.log('Creating fresh hospital_db...');
        await connection.query('CREATE DATABASE hospital_db;');
        
        console.log('Selecting hospital_db...');
        await connection.query('USE hospital_db;');

        console.log('Building robust schema...');
        const schema = `
            CREATE TABLE Users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('patient', 'doctor', 'admin') NOT NULL DEFAULT 'patient',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE Patients (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT UNIQUE,
                full_name VARCHAR(100) NOT NULL,
                dob DATE,
                gender ENUM('Male', 'Female', 'Other'),
                phone VARCHAR(15),
                address TEXT,
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
            );

            CREATE TABLE Doctors (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT UNIQUE,
                full_name VARCHAR(100) NOT NULL,
                specialty VARCHAR(100) NOT NULL,
                experience_years INT,
                phone VARCHAR(15),
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
            );

            CREATE TABLE Appointments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                patient_id INT,
                doctor_id INT,
                appointment_date DATE NOT NULL,
                appointment_time TIME NOT NULL,
                status ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled') DEFAULT 'Pending',
                reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (patient_id) REFERENCES Patients(id) ON DELETE CASCADE,
                FOREIGN KEY (doctor_id) REFERENCES Doctors(id) ON DELETE CASCADE
            );
            
            INSERT INTO Users (username, password_hash, role) VALUES ('admin', '$2b$10$wKOSYg.SOHyB/GZ2Y.XgI.b9Vf7oH65B4lO7DTo6xHcw0p.lEa3rS', 'admin');
        `;
        
        await connection.query(schema);
        console.log('SUCCESS! Database tables rebuilt successfully with standard schema.');
        
        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('FATAL ERROR:', err.message);
        process.exit(1);
    }
}

setupDatabase();
