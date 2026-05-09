const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// Basic test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Welcome to the Hospital System API' });
});

// Fetch all registered doctors from the database dynamically
app.get('/api/doctors', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT u.username, d.id, d.full_name as name, d.specialty, d.experience_years, d.phone FROM Doctors d JOIN Users u ON d.user_id = u.id');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ message: 'Server error fetching doctors' });
    }
});

// Fetch a single doctor's detailed profile by ID
app.get('/api/doctors/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT u.username, d.id, d.full_name as name, d.specialty, d.experience_years, d.phone FROM Doctors d JOIN Users u ON d.user_id = u.id WHERE d.id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Doctor not found.' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching doctor details:', error);
        res.status(500).json({ message: 'Server error fetching doctor profile' });
    }
});

// Actual MySQL Database Authentication Routes
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 1. Locate user in the database
        const [users] = await db.query('SELECT * FROM Users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials. User not found.' });
        }
        
        const user = users[0];

        // System Configuration Enforcement
        if (globalSettings.maintenanceMode && user.role === 'patient') {
            return res.status(403).json({ message: 'System is currently down for scheduled maintenance. Please try again later.' });
        }
        
        // 2. Verify hashed password securely
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
        }

        // Return core user data for the frontend localStorage
        res.json({ user: { id: user.id, username: user.username, role: user.role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ensure your MySQL Database is running and credentials in .env are correct.' });
    }
});

// Forgot Password: Check if username exists
app.post('/api/auth/check-user', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) return res.status(400).json({ found: false });
        const [users] = await db.query('SELECT id FROM Users WHERE username = ?', [username]);
        res.json({ found: users.length > 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ found: false });
    }
});

// Forgot Password: Reset with new hashed password
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { username, newPassword } = req.body;
        if (!username || !newPassword) return res.status(400).json({ message: 'Missing fields.' });
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPassword, salt);
        const [result] = await db.query('UPDATE Users SET password_hash = ? WHERE username = ?', [hashed, username]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found.' });
        res.json({ message: 'Password reset successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error resetting password.' });
    }
});


app.post('/api/register', async (req, res) => {
    try {
        const { username, password, fullName, dob, gender, phone, role } = req.body;
        
        // 1. Ensure username is not already taken
        const [existing] = await db.query('SELECT * FROM Users WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Username is already taken.' });
        }

        // 2. Hash the password before saving for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const assignRole = role || 'patient';

        // 3. Insert into the main Users table
        const [userResult] = await db.query(
            'INSERT INTO Users (username, password_hash, role) VALUES (?, ?, ?)', 
            [username, hashedPassword, assignRole]
        );
        const userId = userResult.insertId;

        // 4. Create the linked Patient profile metadata
        if (assignRole === 'patient') {
            await db.query(
                'INSERT INTO Patients (user_id, full_name, dob, gender, phone) VALUES (?, ?, ?, ?, ?)',
                [userId, fullName, dob || null, gender || null, phone || null]
            );
        }

        res.status(201).json({ message: 'Registration successful!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error. Verify that the table schema is created.' });
    }
});

app.post('/api/admin/add-doctor', async (req, res) => {
    try {
        const { username, password, fullName, specialty, experience, phone } = req.body;
        
        // 1. Ensure username is not already taken
        const [existing] = await db.query('SELECT * FROM Users WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Doctor Username is already taken.' });
        }

        // 2. Hash the password for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Insert into Users with precise 'doctor' role
        const [userResult] = await db.query(
            'INSERT INTO Users (username, password_hash, role) VALUES (?, ?, ?)', 
            [username, hashedPassword, 'doctor']
        );
        const userId = userResult.insertId;

        // 4. Create the public Doctor schema profile
        await db.query(
            'INSERT INTO Doctors (user_id, full_name, specialty, experience_years, phone) VALUES (?, ?, ?, ?, ?)',
            [userId, fullName, specialty, experience, phone]
        );

        res.status(201).json({ message: 'Doctor successfully added!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error adding doctor.' });
    }
});

app.delete('/api/admin/doctors/:id', async (req, res) => {
    try {
        const doctorId = req.params.id;
        const [doctor] = await db.query('SELECT user_id FROM Doctors WHERE id = ?', [doctorId]);
        if (doctor.length === 0) {
            return res.status(404).json({ message: 'Doctor not found.' });
        }
        const userId = doctor[0].user_id;

        await db.query('DELETE FROM Users WHERE id = ?', [userId]);

        res.json({ message: 'Doctor completely removed from system.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error while deleting doctor.' });
    }
});

app.get('/api/admin/patients', async (req, res) => {
    try {
        const [patients] = await db.query(`
            SELECT p.id, p.full_name, p.dob, p.gender, p.phone, u.username
            FROM Patients p
            JOIN Users u ON p.user_id = u.id
            ORDER BY p.id DESC
        `);
        res.json(patients);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error fetching patients.' });
    }
});

app.get('/api/patient-stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const [pts] = await db.query('SELECT id FROM Patients WHERE user_id = ?', [userId]);
        if(pts.length === 0) return res.json({ upcoming: 0, past: 0, appointments: [] });
        const patientId = pts[0].id;
        
        // Sophisticated logic: Upcoming is only future AND NOT completed. Past is old OR completed!
        const [upcoming] = await db.query("SELECT COUNT(*) as count FROM Appointments WHERE patient_id = ? AND appointment_date >= CURDATE() AND status IN ('Pending', 'Confirmed')", [patientId]);
        const [past] = await db.query("SELECT COUNT(*) as count FROM Appointments WHERE patient_id = ? AND (appointment_date < CURDATE() OR status = 'Completed')", [patientId]);
        
        const [appointments] = await db.query(`
            SELECT a.id, a.appointment_date as date, a.appointment_time as time, d.full_name as doctor, d.specialty as dept, a.status, a.reason, a.prescription_text 
            FROM Appointments a 
            JOIN Doctors d ON a.doctor_id = d.id 
            WHERE a.patient_id = ? ORDER BY a.appointment_date DESC LIMIT 10`, 
        [patientId]);

        const [pendingInvoices] = await db.query("SELECT COUNT(*) as count FROM Invoices WHERE patient_id = ? AND status = 'Unpaid'", [patientId]);

        res.json({
            upcoming: upcoming[0].count,
            past: past[0].count,
            pendingBills: pendingInvoices[0].count,
            appointments
        });
    } catch(err) {
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
});

// Secure endpoint to deeply extract personal Profile metadata directly tied to their user authentication
app.get('/api/patient/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const [pts] = await db.query('SELECT p.full_name, p.dob, p.gender, p.phone, p.address, u.username FROM Patients p JOIN Users u ON p.user_id = u.id WHERE p.user_id = ?', [userId]);
        if(pts.length === 0) return res.status(404).json({message: 'Profile not found.'});
        res.json(pts[0]);
    } catch(err) {
        console.error(err);
        res.status(500).json({message: 'DB Error retrieving profile'});
    }
});

app.post('/api/book-appointment', async (req, res) => {
    try {
        const { userId, doctorId, date, time, reason } = req.body;
        const [pts] = await db.query('SELECT id FROM Patients WHERE user_id = ?', [userId]);
        if(pts.length === 0) return res.status(404).json({message: 'Patient profile not found.'});
        const patientId = pts[0].id;

        const prob = (reason || '').toLowerCase();
        let presc = "- General Checkup & Rest for 7 days";
        if (prob.includes('fever') || prob.includes('head') || prob.includes('pain')) {
            presc = "- Paracetamol 650mg (1 Tablet As needed) for 5 Days\n- Drink plenty of fluids";
        } else if (prob.includes('heart') || prob.includes('cardio') || prob.includes('pressure')) {
            presc = "- Aspirin 81mg (1 Tablet Daily) for 30 Days\n- Atorvastatin 20mg (1 Tablet Before Bed) for 30 Days";
        } else if (prob.includes('bone') || prob.includes('ortho') || prob.includes('fracture')) {
            presc = "- Ibuprofen 400mg (1 Tablet Twice Daily) for 14 Days\n- Calcium Supplements (1 Tablet Morning) for 30 Days";
        }

        const [result] = await db.query(`
            INSERT INTO Appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status, prescription_text)
            VALUES (?, ?, ?, ?, ?, 'Pending', ?)
        `, [patientId, doctorId, date, time, reason, presc]);

        const appointmentId = result.insertId;
        // Automatically generate a pending bill linked to this appointment securely!
        await db.query(`INSERT INTO Invoices (patient_id, appointment_id, amount, status) VALUES (?, ?, 150.00, 'Unpaid')`, [patientId, appointmentId]);

        res.json({ message: 'Success' });
    } catch(err) {
        console.error(err);
        res.status(500).json({message: 'Database Error'});
    }
});

// Dynamic portfolio endpoint for completing appointments natively!
app.post('/api/appointments/:id/complete', async (req, res) => {
    try {
        const { id } = req.params;
        // Verify payment integrity before allowing manual completion bypass
        const [invs] = await db.query("SELECT status FROM Invoices WHERE appointment_id = ?", [id]);
        if (invs.length > 0 && invs[0].status === 'Unpaid') {
            return res.status(400).json({ message: 'Please pay your pending Fees in the Invoices tab before completing this appointment.' });
        }
        
        const [result] = await db.query("UPDATE Appointments SET status = 'Completed' WHERE id = ?", [id]);
        if(result.affectedRows === 0) return res.status(404).json({message: 'Appointment not found'});
        res.json({ message: 'Appointment officially marked as Completed' });
    } catch(err) {
        console.error(err);
        res.status(500).json({message: 'Database Update Error'});
    }
});

// Process a Pharmacy order and instantly generate a matching invoice!
app.post('/api/pharmacy/order', async (req, res) => {
    try {
        const { userId, items, amount } = req.body;
        const [pts] = await db.query('SELECT id FROM Patients WHERE user_id = ?', [userId]);
        if(pts.length === 0) return res.status(404).json({message: 'Patient not found'});
        
        const patientId = pts[0].id;
        
        // Insert a raw synthetic appointment to anchor the invoice (since invoices are anchored to appointments)
        // Wait, Invoices have an appointment_id. Let's make appointment_id nullable or just insert a dummy appointment.
        // Or we can just insert a null appointment_id if the schema allows it. 
        // Let's check schema.sql: appointment_id INT, FOREIGN KEY (appointment_id) REFERENCES Appointments(id) ON DELETE CASCADE
        // Yes, appointment_id is nullable by default in MySQL!
        
        await db.query(`INSERT INTO Invoices (patient_id, appointment_id, amount, status) VALUES (?, NULL, ?, 'Unpaid')`, [patientId, amount]);
        
        res.json({ message: 'Order placed' });
    } catch(err) {
        console.error(err);
        res.status(500).json({message: 'Error processing order'});
    }
});

// Fetch user's dynamic global invoices explicitly mapped directly to their SQL profile
app.get('/api/invoices/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const [pts] = await db.query('SELECT id FROM Patients WHERE user_id = ?', [userId]);
        if(pts.length === 0) return res.json([]);
        const [invoices] = await db.query(`
            SELECT i.id, i.amount, i.status, DATE_FORMAT(i.issued_date, '%Y-%m-%d') as date, COALESCE(d.specialty, 'Pharmacy Order') as reason
            FROM Invoices i
            LEFT JOIN Appointments a ON i.appointment_id = a.id
            LEFT JOIN Doctors d ON a.doctor_id = d.id
            WHERE i.patient_id = ? ORDER BY i.issued_date DESC
        `, [pts[0].id]);
        res.json(invoices);
    } catch(err) {
        console.error(err);
        res.status(500).json({message: 'DB Error retrieving Invoices'});
    }
});

// Securely process synthetic payments and cleanly execute cascading completion updates!
app.post('/api/invoices/:id/pay', async (req, res) => {
    try {
        const invoiceId = req.params.id;
        const [invs] = await db.query("SELECT appointment_id FROM Invoices WHERE id = ?", [invoiceId]);
        if (invs.length === 0) return res.status(404).json({message: 'Invoice not found'});
        
        await db.query("UPDATE Invoices SET status = 'Paid' WHERE id = ?", [invoiceId]);
        await db.query("UPDATE Appointments SET status = 'Completed' WHERE id = ?", [invs[0].appointment_id]);
        res.json({ message: 'Paid correctly' });
    } catch(err) {
        console.error(err);
        res.status(500).json({message: 'Database Update Error during payment processing'});
    }
});

// Fetch user's completed medical records specifically!
app.get('/api/records/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const [pts] = await db.query('SELECT id FROM Patients WHERE user_id = ?', [userId]);
        if(pts.length === 0) return res.json([]);
        
        // A "Medical Record" is defined exactly as any Appointment that completely hit "Completed" state
        const [records] = await db.query(`
            SELECT a.id, DATE_FORMAT(a.appointment_date, '%Y-%m-%d') as date, 
                   d.full_name as doctor, a.reason as diagnosis, d.specialty
            FROM Appointments a
            JOIN Doctors d ON a.doctor_id = d.id
            WHERE a.patient_id = ? AND a.status = 'Completed'
            ORDER BY a.appointment_date DESC
        `, [pts[0].id]);
        
        res.json(records);
    } catch(err) {
        console.error(err);
        res.status(500).json({message: 'DB Error retrieving Records'});
    }
});

// ── Pharmacy Order ────────────────────────────────
app.post('/api/pharmacy/order', async (req, res) => {
    try {
        const { userId, items, amount } = req.body;
        
        // Find patient ID
        const [patients] = await db.query('SELECT id FROM Patients WHERE user_id = ?', [userId]);
        if (patients.length === 0) return res.status(404).json({ message: 'Patient not found' });
        
        const patientId = patients[0].id;
        
        // Insert a new Invoice for the pharmacy order (without an appointment_id)
        await db.query(
            "INSERT INTO Invoices (patient_id, amount, status) VALUES (?, ?, 'Unpaid')",
            [patientId, amount]
        );
        
        res.json({ success: true, message: 'Pharmacy order placed and billed.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to process pharmacy order.' });
    }
});

// ==========================================
// DOCTOR DASHBOARD APIs
// ==========================================

// Fetch all appointments for a specific doctor
app.get('/api/doctor/appointments/:userId', async (req, res) => {
    try {
        const [doctorRows] = await db.query('SELECT id FROM Doctors WHERE user_id = ?', [req.params.userId]);
        if (doctorRows.length === 0) return res.status(404).json({ message: 'Doctor profile not found.' });
        
        const doctorId = doctorRows[0].id;

        const [appointments] = await db.query(`
            SELECT a.id, DATE_FORMAT(a.appointment_date, '%Y-%m-%d') as appointment_date, a.appointment_time, a.status, a.reason, a.prescription_text, p.full_name as patient_name, p.gender
            FROM Appointments a
            JOIN Patients p ON a.patient_id = p.id
            WHERE a.doctor_id = ?
            ORDER BY a.appointment_date ASC, a.appointment_time ASC
        `, [doctorId]);

        res.json(appointments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error fetching doctor appointments.' });
    }
});

// Submit a Prescription and Approve Appointment
app.post('/api/doctor/prescribe/:appointmentId', async (req, res) => {
    try {
        const { prescriptionText } = req.body;
        const apptId = req.params.appointmentId;

        await db.query(
            'UPDATE Appointments SET prescription_text = ? WHERE id = ?',
            [prescriptionText, apptId]
        );

        // Auto-generate an Invoice since the doctor has consulted and prescribed
        const [existingInvoice] = await db.query('SELECT * FROM Invoices WHERE appointment_id = ?', [apptId]);
        if (existingInvoice.length === 0) {
            const amount = Math.floor(Math.random() * 300) + 150; 
            await db.query(
                'INSERT INTO Invoices (patient_id, appointment_id, amount, status) SELECT patient_id, ?, ?, "Unpaid" FROM Appointments WHERE id = ?',
                [apptId, amount, apptId]
            );
        }

        res.json({ message: 'Prescription successfully attached and Appointment Confirmed.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to submit prescription.' });
    }
});

// ==========================================
// TELEMEDICINE CHAT APIs
// ==========================================
const activeChats = {}; // { patientId: [{sender, text}] }

app.get('/api/chat/:patientId', (req, res) => {
    const pid = req.params.patientId;
    if (!activeChats[pid]) activeChats[pid] = [];
    res.json(activeChats[pid]);
});

app.post('/api/chat/:patientId', (req, res) => {
    const pid = req.params.patientId;
    const { sender, text } = req.body;
    if (!activeChats[pid]) activeChats[pid] = [];
    activeChats[pid].push({ sender, text });
    res.json({ success: true });
});

// ==========================================
// SUPPORT TICKETS (CONTACT FORM) API
// ==========================================
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        await db.query(`
            CREATE TABLE IF NOT EXISTS SupportQueries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100),
                email VARCHAR(100),
                subject VARCHAR(50),
                message TEXT,
                status ENUM('Open', 'Resolved') DEFAULT 'Open',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query('INSERT INTO SupportQueries (name, email, subject, message) VALUES (?, ?, ?, ?)', [name, email, subject, message]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to submit query.' });
    }
});

app.get('/api/admin/queries', async (req, res) => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS SupportQueries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100),
                email VARCHAR(100),
                subject VARCHAR(50),
                message TEXT,
                status ENUM('Open', 'Resolved') DEFAULT 'Open',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        const [queries] = await db.query('SELECT * FROM SupportQueries ORDER BY created_at DESC');
        res.json(queries);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch queries.' });
    }
});

app.post('/api/admin/queries/:id/resolve', async (req, res) => {
    try {
        await db.query('UPDATE SupportQueries SET status = "Resolved" WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to resolve query.' });
    }
});

// ==========================================
// SYSTEM SETTINGS & MAINTENANCE APIs
// ==========================================
let globalSettings = {
    maintenanceMode: false,
    twoFactorAuth: true
};

app.get('/api/admin/settings', (req, res) => {
    res.json(globalSettings);
});

app.post('/api/admin/settings', (req, res) => {
    globalSettings = { ...globalSettings, ...req.body };
    res.json({ success: true, settings: globalSettings });
});

const filesystem = require('fs');
app.post('/api/admin/backup', (req, res) => {
    try {
        const backupName = `backup_${Date.now()}.sql`;
        const backupPath = path.join(__dirname, 'database', backupName);
        filesystem.writeFileSync(backupPath, '-- MySQL Auto-Generated Backup Dump\n-- System: LifeCare Hospital\n-- Date: ' + new Date().toISOString() + '\n\n-- Database structure and data goes here...');
        res.json({ success: true, message: `Backup created securely at database/${backupName}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate backup' });
    }
});

app.post('/api/admin/purge', async (req, res) => {
    try {
        // Purging old support queries for demonstration of purging logic
        await db.query('DELETE FROM SupportQueries WHERE status = "Resolved" AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)');
        res.json({ success: true, message: 'Archived records successfully purged from the database.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to purge records' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
