<div align="center">
  <img src="frontend/public/logo.png" alt="MediRecord Logo" width="320" />

  <h1>MediRecord — Smart EMR & Clinic Management</h1>

  <p>
    <a href="https://medirecord-x0jg.onrender.com" target="_blank">🌐 Live Demo</a> ·
    <a href="https://github.com/princechouhan19/medirecord">GitHub</a> ·
    Built for Indian Diagnostic Clinics
  </p>

  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&logoColor=white" />
</div>

---

## What is MediRecord?

MediRecord is a production-grade, full-stack Electronic Medical Record (EMR) platform built specifically for Indian diagnostic clinics — sonography centres, pathology labs, imaging centres, and multispeciality clinics. It handles the complete patient lifecycle from registration through government-compliant PNDT documentation, with smart billing, live queue management, and 4-tier role-based access control.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, Express, MongoDB + Mongoose |
| **Frontend** | React 18, Vite, SCSS, GSAP animations |
| **Auth** | JWT + bcryptjs (role-based) |
| **Routing** | React Router v6 (protected routes per role) |
| **File Storage** | ImageKit (logos, profile photos) |
| **Security** | Helmet, CORS, express-rate-limit |
| **Deployment** | Render.com (single-service, frontend served from Express) |

---

## 4-Tier Role System

```
superadmin
  └── Registers clinics, assigns Clinic IDs, manages subscriptions
      └── clinic_owner  (1 per clinic)
            ├── Manages staff, test fees, discount permissions, logos
            ├── Views all data + activity audit log
            └── receptionist  /  lab_handler  /  doctor
                    │                  │              │
                Register patients   Run tests     View referred
                Fill F-Forms        Mark complete  patients
                Create bills        Update queue
```

| Role | Home Route | Key Permissions |
|------|-----------|----------------|
| `superadmin` | `/admin` | Full platform — clinics, subscriptions, Clinic ID assignment |
| `clinic_owner` | `/clinic` | Full clinic — staff, fees, audit, settings, billing |
| `receptionist` | `/reception` | Register patients, queue, F-Forms, billing |
| `lab_handler` | `/lab` | Queue pickup, mark in-progress / complete |
| `doctor` | `/reception` | View patients, referred cases |

---

## Feature Set (v4)

### Patient Management
- Register with name, age, gender, phone, LMP, husband/father name, address
- **Auto token number** per day (`#001`, `#002`…) — resets daily
- Test category + sub-test selection with auto-filled fee from clinic config
- Payment mode: cash / UPI / card / pending
- **Printable receipt** with token number, patient details, fee

### Live Queue Board
- Real-time daily queue auto-refreshed every 15 seconds
- Status flow: `Waiting → In Progress → Completed / Cancelled`
- Role-gated actions: Lab Handler clicks **Start** / **Complete**
- Filter by status (Waiting / In Progress / Completed / All)

### Billing System
- Create bills with line items, auto-filled from patient test
- **Discount support**: flat amount or percentage
- Clinic owner controls which staff can apply discounts
- **Save as PDF** via browser print dialog (zero dependencies — clean output)
- Bill preview with clinic logo, patient info, totals

### F-Form (Clinical Findings)
- Sections: Patient, History & Complaint, Vitals (6 fields), Examination, Diagnosis & Treatment
- **AI ICD-10 suggestion** from chief complaint text
- Today's patients shown first in dropdown
- **Saved Forms tab** — browse all saved forms
- **Print / Save PDF** — opens dedicated print window (browser → Save as PDF)
- **Share** — native share API or clipboard copy
- Auto-generated form number (`FF-00001`)
- Clinic logo appears in printed form

### PNDT 12-Column Register (Form F)
- Matches the physical government form exactly
- 12 columns: Sr. No., Reg. No., Date, Patient Name+Age, Address, Referred By, Living Children, LMP/Weeks, Non-Invasive Indication, Invasive Indication, Declaration Date, Result/Findings
- Filter by month + year
- Empty rows auto-filled to minimum 20 per page
- Print-ready with radiologist signature lines

### Test & Fee Manager
- Clinic owner configures test categories (Sonography, X-Ray, Blood Test, CT Scan, MRI…)
- Sub-tests per category: USG Obstetric ₹600 / ANC ₹500 / TVS ₹800 / ABD ₹500…
- **Load Defaults** button pre-populates common Indian clinic tests
- Fees auto-fill on patient registration

### Staff Management
- Add receptionist / lab handler / doctor with login credentials
- **Click staff card** → detail modal with:
  - 7-day activity bar chart
  - Action summary (registered / started / completed)
  - Recent activity log
- Activate / deactivate accounts

### Activity Audit Log
- Every patient registration, status change, completion logged with timestamp
- Filter by staff member and/or date
- Per-staff summary cards (registered / started / completed counts)

### Clinic Settings
- **Clinic logo upload** (ImageKit) — used in F-Forms and Bills
- **Profile photo upload** for clinic owner
- Edit all clinic details (name, address, PNDT reg no, license, specialization)
- **Discount permissions** — checkboxes to allow receptionist/lab handler to give discounts
- Change password

### Subscription & Notifications
- Superadmin assigns plan (Free / Pro) + duration (1 / 6 / 12 months) per clinic
- **Expiry warning bars**: amber at 30 days, red at 7 days — on clinic dashboard, settings, and admin panel
- Superadmin sees per-clinic expiry banners on clinics list
- Suspend / activate clinics (cascades to all staff)

### Public Landing Page (`/`)
- Hero with features, stats, mockup placeholder (add your screenshots)
- Features grid (6 cards)
- Pricing section (Free / Pro / Enterprise)
- CTA + footer
- Unauthenticated visitors only — logged-in users redirect to their dashboard

---

## Project Structure

```
medirecord/
├── backend/
│   ├── server.js                    # Entry point (keep-alive for Render free tier)
│   ├── .env.example                 # All required env variables documented
│   └── src/
│       ├── app.js                   # Express app, all routes registered
│       ├── config/
│       │   ├── db.js                # MongoDB connection
│       │   └── imagekit.js          # ImageKit lazy-init (safe if keys absent)
│       ├── models/
│       │   ├── User.model.js        # 5 roles, clinic ref, profileImage
│       │   ├── Clinic.model.js      # clinicId, testCategories (sub-tests), logoUrl, discountRoles
│       │   ├── Patient.model.js     # tokenNo, status workflow, fee, lmp, husbandName
│       │   ├── FForm.model.js       # vitals, ICD-10, prescriptions, formNumber auto-gen
│       │   ├── Bill.model.js        # line items, discount (flat/%), total auto-calc
│       │   ├── Report.model.js      # diagnostic reports
│       │   ├── Tracking.model.js    # visit tracking / overdue
│       │   └── ActivityLog.model.js # every staff action logged
│       ├── controllers/
│       │   ├── auth.controller.js   # login, register, getMe, changePassword, setup-superadmin
│       │   ├── clinic.controller.js # CRUD + staff + test categories + logo/discount settings
│       │   ├── patient.controller.js# getTodayQueue, updateStatus, PNDT register, activity log
│       │   ├── fform.controller.js  # F-Form CRUD, clinic-scoped
│       │   ├── bill.controller.js   # Bill CRUD + stats
│       │   ├── report.controller.js # Diagnostic reports
│       │   ├── tracking.controller.js
│       │   └── upload.controller.js # ImageKit upload/delete
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── clinic.routes.js     # /my/* routes BEFORE /:id (ordering critical)
│       │   ├── patient.routes.js
│       │   ├── fform.routes.js
│       │   ├── bill.routes.js
│       │   ├── report.routes.js
│       │   ├── tracking.routes.js
│       │   └── upload.routes.js
│       └── middlewares/
│           ├── auth.middleware.js   # authenticate, requireRole
│           ├── upload.middleware.js # multer (memory storage, 5MB limit)
│           └── error.middleware.js
│
└── frontend/
    ├── public/
    │   ├── logo.png                 # Full logo (icon + MediRecord text)
    │   └── loginillustration.png    # Doctor illustration for login page
    └── src/
        ├── App.jsx + AppRoutes.jsx  # Centralized routing, role guards
        ├── services/api.js          # Axios instance, 401 interceptor
        ├── styles/global.scss       # Design tokens, responsive breakpoints, utilities
        ├── components/Layout/
        │   ├── Sidebar.jsx          # Role-aware nav, logo.png, mobile close button
        │   ├── MobileTopbar.jsx     # Hamburger + logo.png (mobile only)
        │   ├── MobileNav.jsx        # Bottom tab bar (mobile only)
        │   └── MainLayout.jsx       # Desktop sidebar + mobile overlay drawer
        └── features/
            ├── auth/                # LoginPage (clean card design, illustration)
            ├── landing/             # Public landing page with pricing
            ├── admin/               # Super admin: platform stats, clinic cards + detail popup
            ├── clinic/              # Clinic owner: dashboard, patients, staff, activity, settings
            ├── reception/           # Receptionist: dashboard, register patient (token+receipt)
            ├── lab/                 # Lab handler: queue dashboard
            ├── queue/               # Shared live queue (kanban cards, 15s auto-refresh)
            ├── fform/               # F-Form with AI ICD-10, saved forms tab, PDF export
            ├── billing/             # Bill creation with discounts, PDF/print
            ├── pndt/                # 12-column PNDT register, print-ready
            ├── tests/               # Test & fee manager with Load Defaults
            ├── tracking/            # Visit tracking (legacy)
            ├── reporting/           # Diagnostic reports (legacy)
            └── profile/             # Profile + change password
```

---

## API Reference

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/setup-superadmin` | Public (once) | Create first superadmin |
| POST | `/api/auth/login` | Public | Login, returns JWT + user |
| GET  | `/api/auth/me` | Auth | Get current user + clinic |
| PATCH | `/api/auth/profile` | Auth | Update name, phone, profileImage |
| PATCH | `/api/auth/change-password` | Auth | Change password |

### Clinics (Superadmin)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET  | `/api/clinics/stats` | superadmin | Platform stats |
| GET  | `/api/clinics` | superadmin | All clinics with patient/staff counts |
| POST | `/api/clinics` | superadmin | Register clinic + create owner account |
| PATCH | `/api/clinics/:id` | superadmin | Update clinic |
| PATCH | `/api/clinics/:id/toggle` | superadmin | Suspend/activate clinic + all staff |

### Clinics (Owner)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET  | `/api/clinics/my/clinic` | clinic_owner | My clinic details |
| PATCH | `/api/clinics/my/clinic` | clinic_owner | Update clinic info |
| PATCH | `/api/clinics/my/logo` | clinic_owner | Logo, profile photo, discount settings |
| GET  | `/api/clinics/my/staff` | clinic_owner | All staff |
| POST | `/api/clinics/my/staff` | clinic_owner | Add staff member |
| PATCH | `/api/clinics/my/staff/:id/toggle` | clinic_owner | Activate/deactivate staff |
| GET  | `/api/clinics/my/tests` | owner+staff | Test categories + fees |
| POST | `/api/clinics/my/tests` | clinic_owner | Add/update test category |
| DELETE | `/api/clinics/my/tests/:catId` | clinic_owner | Remove test category |

### Patients
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET  | `/api/patients/today` | All clinic | Today's queue with stats |
| GET  | `/api/patients/stats` | All clinic | Total, this week, today counts |
| GET  | `/api/patients/pndt` | All clinic | PNDT register by month/year |
| GET  | `/api/patients/activity` | All clinic | Activity audit log |
| GET  | `/api/patients` | All clinic | All patients (search + date filter) |
| POST | `/api/patients` | receptionist+ | Register patient, auto token |
| PATCH | `/api/patients/:id/status` | lab_handler+ | Update queue status |
| DELETE | `/api/patients/:id` | clinic_owner+ | Delete patient |

### F-Forms
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET  | `/api/fform` | All clinic | All forms (clinic-scoped) |
| GET  | `/api/fform/:id` | All clinic | Single form with full populate |
| GET  | `/api/fform/patient/:patientId` | All clinic | Forms for a patient |
| POST | `/api/fform` | All clinic | Create F-Form |
| PATCH | `/api/fform/:id` | All clinic | Update form |

### Bills
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET  | `/api/bills/stats` | All clinic | Today count + revenue totals |
| GET  | `/api/bills` | All clinic | Bills (date filter) |
| GET  | `/api/bills/:id` | All clinic | Single bill with full populate |
| POST | `/api/bills` | receptionist+ | Create bill with discount |
| PATCH | `/api/bills/:id` | receptionist+ | Update bill |
| DELETE | `/api/bills/:id` | clinic_owner+ | Delete bill |

---

## Setup & First Run

### 1. Clone & Install
```bash
git clone https://github.com/princechouhan19/medirecord.git
cd medirecord

# Install all dependencies
npm run install-all   # runs npm install in both /backend and /frontend
```

### 2. Configure Environment
```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medirecord
JWT_SECRET=your-random-64-char-secret-here
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Optional — for logo/photo uploads
IMAGEKIT_PUBLIC_KEY=your_key
IMAGEKIT_PRIVATE_KEY=your_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# Render keep-alive (set to your deployed URL)
RENDER_EXTERNAL_URL=https://medirecord-x0jg.onrender.com
```

### 3. Run Locally
```bash
# Terminal 1 — Backend
cd backend && npm run dev       # http://localhost:5000

# Terminal 2 — Frontend
cd frontend && npm run dev      # http://localhost:5173 (proxied to :5000)
```

### 4. First-Time Clinic Setup Flow
1. Login as superadmin → `/admin/clinics` → **Register Clinic**
   - Fill clinic details, assign Clinic ID (e.g. `LIFE-001`), choose plan + duration
   - Enter owner email + password — owner account created automatically
2. Login as clinic owner → `/clinic/tests` → **Load Defaults** (adds Sonography, X-Ray, Blood Test etc.)
3. `/clinic/staff` → Add Receptionist + Lab Handler
4. Receptionist logs in → `/reception/register` → registers first patient
5. Lab Handler logs in → `/lab/queue` → picks up patient, marks complete

---

## Deployment (Render)

MediRecord is designed to deploy as a **single Render Web Service**:

| Setting | Value |
|---------|-------|
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |
| **Root Directory** | *(leave blank — uses root package.json)* |

The root `package.json` orchestrates:
- `npm run build` → runs `vite build` in `/frontend`, output goes to `/backend/public`
- `npm start` → starts Express which serves both API and the built React app

### Required Environment Variables on Render
```
MONGODB_URI
JWT_SECRET
JWT_EXPIRES_IN=7d
NODE_ENV=production
RENDER_EXTERNAL_URL=https://your-app.onrender.com
```

---

## Version History

### v1 — Initial Release
- Basic patient registration (Aadhaar-based)
- Simple dashboard with patient list, reports, tracking
- F-Form with ICD-10 AI suggestions
- Login page, JWT auth
- Single role (staff)

### v2 — Multi-Clinic Architecture
- **3-tier roles**: superadmin, clinic_owner, staff/doctor
- Super Admin dashboard: register clinics, manage subscriptions
- Clinic Owner dashboard: staff management, clinic settings
- F-Form improvements: saved forms tab, print/download/share
- PNDT 12-column register
- Production cleanup: removed demo Aadhaar numbers, validated inputs

### v3 — 4-Tier Role System + Core Features
- **4th role**: `receptionist` and `lab_handler` (renamed from staff)
- **Live Queue**: kanban board, 15-second auto-refresh, role-gated start/complete
- **Register Patient**: loads clinic test categories, auto-fills fee, generates token, printable receipt
- **Test & Fee Manager**: configure Sonography > ANC/TVS/USG/ABD with prices
- **Activity Audit Log**: every action tracked, per-staff analytics
- **Billing System**: Bill model, create bills with discount, BillView print
- **PNDT Register**: 12-column Form F, filterable by month/year
- Reception Dashboard, Lab Dashboard, Clinic Patients page
- Admin clinics page: clickable clinic cards with detail popup
- Subscription expiry notification banners

### v4 — UI Polish + Landing Page + PDF
- **Login page redesign**: clean white card + solid background (no gradient), `loginillustration.png`
- **Sidebar**: uses full `logo.png` image — no more hardcoded brand text
- **Mobile sidebar fix**: close via backdrop click, close button, and route change
- **MobileTopbar**: `logo.png` only, no duplicate text
- **Landing page** (`/`): hero, features, pricing (Free/Pro/Enterprise), CTA
- **PDF export**: F-Form and Bill "Save PDF" opens browser print window → Save as PDF (no deps)
- `ClinicSettingsPage`: clinic logo upload, owner profile photo, discount role permissions
- `ClinicStaffPage`: click card → modal with 7-day activity bar chart + recent logs
- Responsive: mobile nav, topbar, sidebar overlay, collapsing form grids

### v5 — Clinic Dashboard Upgrade & Bug Fixes
**Here's everything done in this continuation pass:**

#### Bugs fixed:
- **Route Cleanup**: Duplicate `/branches` route removed from reception section.
- **JSX Fix**: Broken `{/* Lab Handler */}` JSX comment (was missing `}`) — fixed build error.
- **PDF Export**: `FFormView` download now uses print-to-PDF instead of saving as raw `.html`.
- **Branding**: `FFormView` preview now shows dynamic clinic logo + name instead of hardcoded "MediRecord".
- **Data Populating**: Bill controller `getOne` now correctly populates `logoUrl` and `gstSettings`.
- **Data Populating**: `FForm` controller `getOne` now correctly populates `logoUrl`.

#### Clinic Dashboard — Full Upgrade:
- **Enhanced Stats**: 8 stat cards including today's bill count, today's revenue, and total revenue (upgraded from 5 cards).
- **Subscription Tracking**: Subscription badge with days-left count added directly to the dashboard header.
- **Branch Overview**: Branch mini-overview appears automatically for clinics with branches, showing per-branch patients + revenue.
- **Staff Visuals**: Staff cards now show profile photos if set.
- **Quick-Links Grid**: Added a practical quick-links grid at the bottom of the staff panel (Test Fees, PNDT, Bills, Audit).
- **Responsive Layout**: Stats grid updated to be 4-column on desktop and 2-column on mobile.

---

## Responsive Design

| Breakpoint | Layout |
|-----------|--------|
| `> 1024px` (Desktop) | Fixed sidebar + full content area |
| `769–1024px` (Tablet) | Sidebar + compact content padding |
| `< 768px` (Mobile) | Hidden sidebar → overlay drawer, sticky topbar, bottom nav tabs |

**Mobile-specific components:**
- `MobileTopbar` — sticky top bar with hamburger + `logo.png`
- `MobileNav` — bottom tab navigation (5 key routes per role)
- Sidebar — slide-in overlay, close on backdrop tap or route change

---

## Data Architecture Notes

### Clinic `testCategories` (Embedded Sub-documents)
```js
clinic.testCategories = [
  {
    name: "Sonography",
    basePrice: 0,
    isActive: true,
    subTests: [
      { name: "USG Obstetric", price: 600 },
      { name: "ANC",           price: 500 },
      { name: "TVS",           price: 800 },
    ]
  }
]
```
This Mongoose embedded array approach avoids a separate collection and loads fee data instantly with the clinic object.

### Patient Queue Model
```js
{
  tokenNo: 42,          // auto-assigned daily counter
  status: "in_progress",// waiting → in_progress → completed
  visitDate: Date,       // used for daily scoping
  fee: 600,
  isPaid: true,
  paymentMode: "upi",
  receiptNo: "RC-829341",
  lmp: Date,             // last menstrual period for OBS
  husbandName: "...",
  referredBy: "Dr. Mehta",
  assignedTo: ObjectId,  // lab handler who picked up
  completedAt: Date,
}
```

### Bill Model
```js
{
  billNo: "BILL-00042",
  items: [{ description: "USG Obstetric", amount: 600 }],
  subtotal: 600,
  discountType: "percent",  // "flat" | "percent"
  discountValue: 10,
  discountAmt: 60,
  total: 540,
  isPaid: true,
  paymentMode: "cash"
}
```
`pre('save')` middleware auto-calculates subtotal, discountAmt, and total.

---

## Contributors

- **Lead Developer**: [Prince Chouhan](https://github.com/princechouhan19)
- **Live**: https://medirecord-x0jg.onrender.com

---

*MediRecord — Built for Indian Clinics* 🇮🇳
