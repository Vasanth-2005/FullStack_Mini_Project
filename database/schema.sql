-- Create Database Framework structurally mapped for AWS RDS deployments
CREATE DATABASE IF NOT EXISTS hospital_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hospital_db;

-- 1. Users Security Table (Handles authentication and global access control)
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('patient', 'doctor', 'admin') NOT NULL DEFAULT 'patient',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Patients Metadata Table
CREATE TABLE IF NOT EXISTS Patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    dob DATE,
    gender ENUM('Male', 'Female', 'Other'),
    phone VARCHAR(15),
    address TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Specialist Doctors Portal Roster
CREATE TABLE IF NOT EXISTS Doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    experience_years INT,
    phone VARCHAR(15),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Central Appointment Booking Pipeline
CREATE TABLE IF NOT EXISTS Appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    doctor_id INT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled') DEFAULT 'Pending',
    reason TEXT,
    prescription_text TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES Patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES Doctors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Integrated Financial Invoices & Billing Table
CREATE TABLE IF NOT EXISTS Invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    appointment_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 150.00,
    status ENUM('Unpaid', 'Paid') DEFAULT 'Unpaid',
    issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES Patients(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES Appointments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Deploy initial Master Administrator for AWS instantiation (Password is 'admin123' if manually hashing, however it's functionally created by API logic)
-- INSERT IGNORE INTO Users (username, password_hash, role) VALUES ('admin@lifecare.com', 'admin123', 'admin');

-- Insert Default Master Administrator Account
-- Password is 'AdminPassword123' (bcrypt hashed for AWS security)
INSERT IGNORE INTO Users (username, password_hash, role) VALUES ('lifecare_admin', '$2b$10$RR9PyY7WsmQjRSHhTGtble9YWMUAJ1MPArhsWMd.DgFY.7nfW66D6', 'admin');
