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

## 🚢 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- ImageKit Account

### 2. Backend Setup
```bash
cd backend
npm install
# Create .env from .env.example
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

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
