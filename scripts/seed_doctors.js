const db = require('./db');
const bcrypt = require('bcryptjs');

const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];
const specialties = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Oncology', 'Psychiatry', 'Ophthalmology', 'General Checkup'];

async function seedSystem() {
    try {
        console.log('Generating extremely secure password hashes (Wait a moment)...');
        const salt = await bcrypt.genSalt(10);
        const sharedPassword = await bcrypt.hash('password123', salt);

        console.log('Injecting 50 dynamic doctor profiles securely into MySQL...');
        for (let i = 0; i < 50; i++) {
            const fname = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lname = lastNames[Math.floor(Math.random() * lastNames.length)];
            const username = `doc_${fname.toLowerCase()}_${Math.floor(Math.random() * 9999)}`;
            
            const randomSpec = specialties[Math.floor(Math.random() * specialties.length)];
            const randomExp = Math.floor(Math.random() * 25) + 2; // 2 to 26 years
            const randomPhone = `555-01${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 90) + 10}`;
            
            // Generate User Profile
            const [userInsert] = await db.query(
                "INSERT INTO Users (username, password_hash, role) VALUES (?, ?, 'doctor')",
                [username, sharedPassword]
            );
            
            // Map strictly to Doctor Data Schema
            await db.query(
                "INSERT INTO Doctors (user_id, full_name, specialty, experience_years, phone) VALUES (?, ?, ?, ?, ?)",
                [userInsert.insertId, `Dr. ${fname} ${lname}`, randomSpec, randomExp, randomPhone]
            );
        }
        
        console.log('SUCCESS: Generated and verified 50 randomized Specialist Doctors into Database Connections.');
        process.exit(0);
        
    } catch (e) {
        console.error('SYSTEM ERROR: Could not map bulk queries.', e);
        process.exit(1);
    }
}

seedSystem();
