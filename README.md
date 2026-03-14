<div align="center">
  <img src="frontend/public/logo.png" alt="MediRecord Logo" width="300" />

  # MediRecord — Smart EMR & Clinic Management System
</div>

MediRecord is a comprehensive, full-stack Electronic Medical Record (EMR) solution designed for clinics and healthcare providers. It provides a seamless interface for patient registration, diagnostic reporting, visit tracking, and essential clinical documentation.

---

## 🚀 Vision
To empower healthcare providers with a lightweight, fast, and feature-rich EMR that simplifies administrative overhead and focuses on patient care.

---

## 🛠 Tech Stack

### Backend
- **Node.js & Express** — High-performance RESTful API.
- **MongoDB & Mongoose** — Scalable NoSQL document storage.
- **ImageKit** — Professional-grade file and image storage for reports and profiles.
- **JWT & bcryptjs** — Secure token-based authentication and industry-standard password hashing.
- **Helmet & Rate Limit** — Defensive security headers and API protection.

### Frontend
- **React 18 & Vite** — Modern UI framework with ultra-fast development server.
- **SCSS** — Scalable CSS with advanced variables and modular architecture.
- **GSAP (GreenSock)** — Premium micro-animations for an interactive user experience.
- **React Router 6** — Robust client-side navigation with protected role-based routing.
- **Lucide React** — Sleek, consistent iconography.

---

## 🔐 4-Tier Role Hierarchy

| Role | Login Path | Can Do |
|------|-----------|--------|
| `superadmin` | `/admin` | Register clinics, assign Clinic IDs, manage subscriptions |
| `clinic_owner` | `/clinic` | Manage staff, set test fees, view all data + audit log |
| `receptionist` | `/reception` | Register patients, collect fees, fill F-Forms |
| `lab_handler` | `/lab` | Pick patients from queue, run tests, mark complete |
| `doctor` | `/reception` | View patients, referred cases |

---

## 📁 Folder Structure

```text
MediRecord/
├── backend/
│   ├── src/
│   │   ├── config/            # Database and service connections
│   │   ├── controllers/       # Business logic for each module
│   │   ├── models/            # Schema definitions
│   │   ├── routes/            # API endpoint definitions
│   │   └── middlewares/       # Security, Auth, and File handlers
│   ├── public/                # Compiled static frontend for production
│   └── server.js              # Application entry point
│
└── frontend/
    └── src/
        ├── features/          # Domain-driven feature modules
        │   ├── auth/          # Authentication flows
        │   ├── admin/         # Super Admin controls
        │   ├── clinic/        # Clinic Owner dashboard
        │   └── tracking/      # Patient lifecycle management
        ├── components/        # Reusable UI components (Layout, Sidebar)
        ├── styles/            # Global SCSS variables and design tokens
        └── services/          # API communication layer
```

---

## 🔥 Key Features

- **Multi-Role Access Control**: Distinct dashboards for Super Admins, Clinic Owners, Doctors, and Staff.
- **Smart Patient Registration**: Quick Aadhaar-based registration and profile management.
- **Clinical Lifecycle Tracking**: Monitor patient visits with smart overdue detection and priority flags.
- **Automated F-Forms**: Digital templates for clinical findings, simplifying data entry.
- **Diagnostic Reporting**: Generate, store, and manage medical reports with ImageKit integration.
- **Beautiful UI/UX**: Premium styling with dark-mode optimized colors and smooth transitions.
- **Production Ready**: Built-in logic to serve the frontend from the backend for single-service deployment.

---

## 📅 Roadmap: The "Next Plan"

Our upcoming release focuses on **Subscription Management** controlled by the Super Admin panel.

### 💳 New Subscription Model
We are moving away from fixed plans to a flexible **Time-Based Subscription** model:
- **Available Tiers**:
  - `Free`: Essential features for small clinics.
  - `Pro`: Full feature set including reports and custom F-Forms.
  - *(Enterprise plan has been removed for simplicity)*

- **Duration Options**:
  - `1 Month`
  - `6 Months`
  - `1 Year`

### ⚙️ Automation Logic
- **Automatic Expiry Tracking**: When a Super Admin registers a clinic, the plan's `EndDate` is automatically calculated from the start date.
- **Smart Notifications**:
  - **Days Remaining**: Clinic owners will see a countdown of days left in their subscription.
  - **In-App Alerts**: Notification banners will appear when the plan is within 7 days of expiry.
  - **Automatic Locking**: Access to premium features will be restricted automatically once the `EndDate` is reached.

---

## 🚢 Quick Start & Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- ImageKit Account

### 2. Installation
```bash
# Setup Backend
cd backend
npm install
# Create .env from .env.example
npm run dev

# Setup Frontend
cd ../frontend
npm install
npm run dev
```

### 3. First-Time configuration
#### A. Create Superadmin (one-time only)
```bash
POST /api/auth/setup-superadmin
{
  "name": "Prince Chouhan",
  "email": "admin@medirecord.in",
  "password": "your-secure-password"
}
```

#### B. Setup Clinic
1. Login as Superadmin → Go to `/admin/clinics` → Register a Clinic.
2. Fill clinic details + PNDT Reg No.
3. Assign a Clinic ID (e.g. `MEDI-001`).
4. Enter owner name, email, password (this creates the Clinic Owner account).

#### C. Clinic Configuration
1. Clinic Owner Logs In → `/clinic/tests` → Add Test Categories.
2. Add "Sonography" → Sub-tests: ANC (₹500), USG Obs (₹600)... or click "⚡ Load Defaults".
3. Clinic Owner → `/clinic/staff` → Add Staff (Receptionist, Lab Handler, Doctors).

---

## 📋 Application Sitemap

| URL | Role | Description |
|-----|------|-------------|
| `/admin` | superadmin | Platform stats, clinic list |
| `/admin/clinics` | superadmin | Register + manage clinics |
| `/clinic` | clinic_owner | Dashboard with live stats |
| `/clinic/queue` | clinic_owner | Live patient queue |
| `/clinic/staff` | clinic_owner | Add/manage staff |
| `/clinic/tests` | clinic_owner | Test categories + fee config |
| `/clinic/pndt` | clinic_owner | 12-column PNDT register |
| `/clinic/activity` | clinic_owner | Staff audit log |
| `/reception` | receptionist | Daily dashboard |
| `/reception/register` | receptionist | Register patient + billing |
| `/reception/queue` | receptionist | Today's queue view |
| `/reception/fform` | receptionist | Fill F-Form |
| `/lab` | lab_handler | Pending patient queue |
| `/lab/queue` | lab_handler | Full queue + status actions |

---

## 🧾 Patient Workflow

1. **Registration**: Receptionist registers patient → Auto token # assigned → Test fee auto-filled → Receipt printable → Patient appears in "Waiting" queue.
2. **Procedure**: Lab Handler picks up patient → Click "Start" (In Progress) → Runs test → Click "Complete" (Completed) → Activity logged.
3. **Documentation**: Receptionist fills F-Form → Select patient → Fill findings → Save → View → Print/Download.

---

## 📝 PNDT Register Compliance (Form F)
Matches the physical 12-column format required by the government:
- Sr. No., Registration No., Date, Patient Name+Age, Address, Referred By, Living Children, LMP/Weeks, Indication, Declaration Date, Result/Findings.
- Filter by month/year, then click **Print** for a court-ready register.

---

## 🌐 Deployment (Render.com)

MediRecord is optimized for deployment as a single **Web Service** on Render:
1. Run `npm run build` in the **frontend**.
2. The build output is automatically copied to `backend/public`.
3. Push to GitHub.
4. On Render, set the root directory to `backend` and use `node server.js` as the start command.

---

## 👥 Contributors

- **Lead Developer**: [Prince Chouhan](https://github.com/princechouhan19)
- **Contributors**: Ronak, Pooja

---
