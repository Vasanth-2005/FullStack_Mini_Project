# LifeCare Hospital Management System 🏥
![LifeCare Presentation](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge) ![Tech Stack](https://img.shields.io/badge/Tech_Stack-Node.js_|_Express_|_MySQL-blue?style=for-the-badge)

A comprehensive, full-stack Hospital Management enterprise portal designed to seamlessly integrate workflows between Administrators, Doctors, and Patients. Built with a robust **Node.js/Express** backend and a normalized **MySQL** database, featuring an advanced, glassmorphism-inspired interface.

## 🌟 Advanced System Features

### 1. The Patient Ecosystem
- **AI Symptom Checker:** Features an animated neural-diagnostic UI that evaluates a user's natural language symptoms and predicts illnesses (e.g. "headache" -> Viral Infection) before recommending an appointment.
- **Bi-Directional Telemedicine Chat:** A simulated WebRTC video room featuring a real-time, API-polled live chat system directly connecting Patients to Doctors.
- **Pharmacy & Lab Portal:** Patients can browse an e-commerce style medical pharmacy to order prescriptions and natively download simulated PDF text copies of their Diagnostic Lab Reports.
- **Emergency SOS Radar:** Instant access to dispatch emergency ambulances to localized regions.

### 2. The Specialist Doctor Portal
- **Real-Time Patient Consultations:** Doctors can launch a Live Chat Room using the patient's ID to provide instantaneous medical feedback.
- **Operation Theater (OT) Scheduler:** Comprehensive overview of surgical schedules, assigned anesthesiologists, and theater statuses.
- **Automated Diagnostic Issuing:** Doctors can electronically issue medical prescriptions which instantly updates the Patient's UI and forces an unpaid invoice to the billing module.

### 3. The Executive Admin Dashboard
- **Global Analytics:** A high-level financial and metric overview featuring a custom-built CSS revenue growth chart.
- **Supply Chain Management:** Contains full CRUD-style dashboards for the **Central Pharmacy Inventory** and **Blood Bank Reserves**, featuring automated low-stock warnings.
- **Bed & Ward Occupancy Tracker:** Real-time animated progress bars visualizing capacity limits across the ICU, Maternity, and General Wards.
- **Support Ticketing Helpdesk:** A fully functional inbox capturing queries from the public landing page's contact form, allowing admins to "Resolve" tickets natively in the database.
- **System Configuration & Security:** Panels to manually trigger "AWS RDS Database Purges" and mock 2FA authentications.

## 💻 Tech Stack
- **Frontend Architecture:** Vanilla JS, HTML5, CSS3. Heavily relies on modern Flexbox/Grid, Glassmorphism aesthetics, and CSS Micro-animations.
- **Backend Infrastructure:** Node.js, Express.js REST APIs.
- **Database Layer:** MySQL relational database (Users, Patients, Doctors, Appointments, Invoices, SupportQueries).
- **Security:** `bcryptjs` for heavy password hashing and localized session tokens.

## 🚀 Installation & Setup (Local)

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Vasanth-2005/FullStack_Mini_Project.git
   cd Hospital_FullStack
   ```

2. **Configure Database:**
   - Ensure MySQL is running on your local machine.
   - Run the provided `database/schema.sql` file in your MySQL environment to natively build the `hospital_db` and seed the master Admin account.

3. **Environment Variables:**
   - Create a `.env` file in the root directory.
   - Add your database credentials:
     ```env
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=hospital_db
     ```

4. **Install Dependencies & Run:**
   ```bash
   npm install
   node server.js
   ```
   Open `http://localhost:3000` in your web browser.

## 🔐 Default Sandbox Credentials
- **Admin Portal:** `lifecare_admin` / `AdminPassword123`
- *Doctors and Patients can be freely registered via the Admin Dashboard and Public Register portals respectively.*
