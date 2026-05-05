# LifeCare Hospital Management System 🏥
![LifeCare Presentation](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge) ![Tech Stack](https://img.shields.io/badge/Tech_Stack-Node.js_|_Express_|_MySQL-blue?style=for-the-badge)

A comprehensive, full-stack Hospital Management portal designed to streamline medical workflows between Administrators, Doctors, and Patients. Built with a robust **Node.js/Express** backend and a heavily normalized **MySQL** database, featuring a dynamic, glassmorphism-inspired UI.

## 🌟 Key Features

### 1. Advanced 3-Tier Role System
- **Master Administrators:** Dedicated secure portal to seamlessly manage the hospital roster. Ability to add, register, and completely wipe specialist Doctors from the system directly via UI.
- **Specialist Doctors:** Private dashboard that pulls patient schedules. Doctors can review symptoms and electronically write and issue PDF-verifiable Medical Prescriptions.
- **Patients:** Intuitive portal to securely book appointments based on department, pay outstanding invoices, and digitally download medical history records and active prescriptions.

### 2. Automated Diagnostic Workflows
- **Smart Prescriptions:** If a doctor is unavailable, the backend AI intelligently evaluates the patient's booked symptoms (e.g. fever, heart, ortho) and auto-generates preliminary medical scripts saved directly to the database.
- **Automated Billing Pipeline:** Generating a prescription seamlessly forces an Appointment to "Confirmed" status and dynamically issues an Unpaid Invoice directly to the patient's billing tab.

### 3. Professional Frontend Architecture
- **Glassmorphism Design:** Deeply stylized modern UI with CSS variables, custom micro-animations, and dynamic sliders.
- **HTML-to-PDF Engine:** Patients can download fully stylized, hospital-stamped diagnostic reports and medical prescriptions in raw PDF/TXT format directly from their browser.
- **Secure Date Restrictions:** Implemented `Flatpickr` for highly localized, unbreakable Date of Birth (1970-2050) and Booking restrictions (DD-MM-YYYY natively translated to MySQL YYYY-MM-DD).

## 💻 Tech Stack
- **Frontend:** Vanilla JS, HTML5, CSS3 (No bulky frameworks, completely custom engineered).
- **Backend:** Node.js, Express.js.
- **Database:** MySQL relational database.
- **Security:** `bcryptjs` for heavy password hashing and secure tokenized local storage.
- **Libraries:** `html2pdf.js` (Document Generation), `Flatpickr` (Date Management).

## 🚀 Installation & Setup (Local)

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/LifeCare-Hospital.git
   cd LifeCare-Hospital
   ```

2. **Configure Database:**
   - Ensure MySQL is running on your machine.
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

## 🔐 Default Credentials
- **Admin Portal:** `lifecare_admin` / `AdminPassword123`
- *Doctors and Patients can be freely registered via the Admin Dashboard and Public Register portals respectively.*
