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
| **File Storage** | ImageKit (logos, profile photos, ID proofs, referral slips) |
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
| `clinic_owner` | `/clinic` | Full clinic — staff, fees, audit, settings, billing, branches |
| `receptionist` | `/reception` | Register patients, queue, F-Forms, billing |
| `lab_handler` | `/lab` | Queue pickup, mark in-progress / complete |
| `doctor` | `/reception` | View patients, referred cases |

---

## Full Feature Set

### Patient Registration (v6 — Complete PNDT-Compliant)
- 4-tab registration flow: Patient Info → ID & Documents → Referral → Test & Payment
- **All PNDT fields**: DOB, age+unit, gender, relative type (Husband/Wife/Father/Mother/Guardian/Self)
- **Living children** with count and ages (M/F separately)
- **Address**: full address, district, state, area type (Rural/Urban)
- **PCTS ID** and Patient Registration Date for govt system
- **ID Proof**: type (Aadhaar, PAN, Voter ID, Passport, DL, Ration Card + more), number, front & back scan upload (JPG/PNG/PDF)
- **Referral Doctor**: type radio (Doctor/GCC/Self-Referral/Other), saved doctor autocomplete, doctor details (qualification, reg no, address, city, phone), referral slip scan upload
- **Pregnancy**: LMP → auto-calc weeks/days/EDD, upcoming test schedule (FOGSI guidelines, 10 milestones)
- **F-Form Required** toggle (auto-ticked from test configuration)
- Auto token number per day, printable receipt

### Form F — PNDT Government Form (v6.1 — Complete)
- **Section A**: Clinic details, doctor name, procedure date, declaration date, full patient info from registration
- **Section B (Non-Invasive)**: All **23 USG indications** as checkboxes per government Form F, procedure type (Ultrasound/Other), result brief, conveyed-to details, MTP indication
- **Section C (Invasive)**: Toggle-enabled, performing doctor, family history, basis of diagnosis (Clinical/Biochemical/Cytogenetic), all indication checkboxes (chromosomal, metabolic, congenital, etc.), consent date (Form G), procedure type (Amniocentesis/CVS/Fetal Biopsy/Cordocentesis), complications, additional tests, result brief
- **Section D (Declaration)**: Patient declaration text (English + Gujarati), thumb impression flag, witness details
- **Clinical Section (Internal)**: Vitals, chief complaint, ICD-10 AI suggestion, history, examination, diagnosis, prescriptions, follow-up
- Saved forms tab, View/Print as PDF

### A4 Patient Record Sheet (3-page print)
- **Page 1**: Clinic logo + header, PNDT 12-column register row, patient identity grid, pregnancy details, test+payment, referred doctor, signature lines
- **Page 2**: ID proof type+number, front/back images, referral slip scan
- **Page 3**: Report scan (if uploaded) or blank report fields for handwriting
- Accessible via 🖨 button on queue cards, patients page, reception dashboard

### Live Queue Board
- Real-time daily queue, 15-second auto-refresh
- Status flow: `Waiting → In Progress → Completed / Cancelled`
- F-Form required badge on cards, pregnancy weeks display
- Print A4 record from any card

### Billing System with GST
- Line items with auto-fill from patient test
- **GST support**: CGST+SGST (intra-state) or IGST (inter-state) with configurable rates
- Discount (flat ₹ or %)
- Clinic owner controls who can apply discounts
- Bill print/PDF with GSTIN, clinic logo, full tax breakdown
- GST configured in Clinic Settings (GSTIN field, rates, type)

### Multi-Branch Clinics
- Clinic owner can add branch locations
- Branches inherit test categories and subscription from parent
- Per-branch patient count and revenue stats
- Consolidated totals on branches page and clinic dashboard

### Referral Doctor Tracker
- Saved referred doctor database per clinic (name, qualification, address, phone, reg no)
- Autocomplete when registering patients
- **Admin dashboard**: aggregated referral counts per doctor across all clinics (commission tracking)

### PNDT 12-Column Register
- Exact government format, 12 columns
- Shows M/F children count, weeks of pregnancy in LMP column
- Correct referred doctor name, declaration date from patient registration date
- Print-ready, minimum 20 rows per page

### Other Features
- **Test & Fee Manager**: sub-tests with fformRequired toggle (📋 shown in registration)
- **Staff Analytics**: click staff card → 7-day bar chart + activity log
- **Subscription expiry notifications**: amber 30d, red 7d — on all relevant pages
- **Activity Audit Log**: every action logged, filterable by staff/date
- **Mobile responsive**: bottom nav, topbar, slide-in sidebar overlay
- **Landing page** (`/`): hero, features, pricing (Free/Pro/Enterprise)
- **Clinic branding**: logo on F-Forms, Bills, A4 record sheets

---

## Schema Architecture Notes

### Why Embedded Sub-documents (not edge collections)
```js
// clinic.testCategories — embedded array, not separate collection
clinic.testCategories = [
  { name: "Sonography", subTests: [{ name:"USG Obs", price:600, fformRequired:true }] }
]
```
**Reason**: Test categories are always read together with the clinic. Embedding avoids a JOIN query on every patient registration. This is the same pattern used by MongoDB Atlas itself for configuration data. Edge collections (graph-style references) would add latency for no benefit here since we don't traverse relationships.

### Patient model — new fields (v6)
```js
{
  dob, relationType, relativeName,          // PNDT identity
  livingChildrenMale, livingChildrenFemale, // children count
  district, state, areaType, pctsId,        // address + govt IDs
  idProofType, idProofNo,                   // ID type
  idProofFront, idProofBack,                // ImageKit URLs (JPG/PDF)
  referredDoctor: {                         // full embedded sub-doc
    name, type, qualification, address, city, phone, regNo
  },
  referralSlip,                             // scanned slip ImageKit URL
  weeksOfPregnancy, daysOfPregnancy, edd,   // pregnancy tracking
  patientRegDate, pctsId,                   // PNDT govt fields
  fformRequired,                            // auto-tick from test config
  reportUrl,                                // final report scan
}
```

### FForm model — Sections A/B/C/D (v6.1)
```js
{
  sectionA: { doctorName, procedureDate, declarationDate, patientRegDate },
  sectionB: {
    performedBy, procedureType,
    indications: { i_viability, ii_dating, ... /* all 23 */ },
    resultBrief, conveyedTo, conveyedDate, mtpIndication,
  },
  sectionC: { enabled, indications, procedure, consentDate, ... },
  sectionD: { thumbImpression, witnessName, witnessAge, ... },
  // + clinical fields: vitals, chiefComplaint, icdCode, etc.
}
```

### Bill model — GST fields
```js
{
  gstEnabled, gstType,                      // CGST_SGST | IGST
  cgstPercent, sgstPercent, igstPercent,    // configurable rates
  cgstAmt, sgstAmt, igstAmt, taxAmt,        // auto-calculated
  discountType, discountValue, discountAmt, // flat | percent
  subtotal, total,                          // pre-save auto-calc
}
```

---

## Project Structure

```
medirecord/
├── backend/
│   ├── server.js
│   ├── .env.example
│   └── src/
│       ├── app.js
│       ├── config/          db.js · imagekit.js
│       ├── models/
│       │   ├── User.model.js
│       │   ├── Clinic.model.js       # testCategories, gstSettings, branches
│       │   ├── Patient.model.js      # full PNDT fields (v6)
│       │   ├── FForm.model.js        # Sections A/B/C/D (v6.1)
│       │   ├── Bill.model.js         # GST fields
│       │   ├── ReferredDoctor.model.js  # saved referred doctors
│       │   ├── ActivityLog.model.js
│       │   ├── Report.model.js
│       │   └── Tracking.model.js
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── clinic.controller.js  # branches, GST settings
│       │   ├── patient.controller.js # getWithClinic for A4 sheet
│       │   ├── fform.controller.js
│       │   ├── bill.controller.js
│       │   ├── referredDoctor.controller.js  # + getAllAdmin
│       │   ├── report.controller.js
│       │   └── upload.controller.js
│       └── routes/
│           ├── auth · clinic · patient · fform · bill
│           ├── referredDoctor.routes.js
│           └── upload.routes.js
└── frontend/
    └── src/
        ├── features/
        │   ├── auth/          # Login (clean card, loginillustration.png)
        │   ├── landing/       # Public landing with pricing
        │   ├── admin/         # Platform dashboard + referral tracker
        │   ├── clinic/        # Owner dashboard + branches page
        │   ├── reception/     # Register patient (4-tab, all fields)
        │   ├── lab/           # Lab handler queue
        │   ├── queue/         # Live queue + A4 print
        │   ├── fform/         # Form F Sections A/B/C/D + Clinical
        │   ├── billing/       # GST billing + BillView
        │   ├── branches/      # Multi-branch management
        │   ├── pndt/          # 12-column PNDT register
        │   └── tests/         # Test fees + fformRequired toggle
        └── components/Layout/ # Sidebar · MobileTopbar · MobileNav
```

---

## API Reference

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/setup-superadmin` | One-time superadmin creation |
| POST | `/api/auth/login` | Returns JWT + user |
| GET  | `/api/auth/me` | Current user + clinic |
| PATCH | `/api/auth/profile` | Update profile |
| PATCH | `/api/auth/change-password` | Change password |

### Clinics
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/clinics/stats` | superadmin | Platform stats |
| GET/POST | `/api/clinics` | superadmin | List / register |
| PATCH | `/api/clinics/:id/toggle` | superadmin | Suspend/activate |
| GET/PATCH | `/api/clinics/my/clinic` | clinic_owner | My clinic |
| PATCH | `/api/clinics/my/logo` | clinic_owner | Logo, GST, discount settings |
| GET/POST | `/api/clinics/my/branches` | clinic_owner | Branches |
| GET/POST | `/api/clinics/my/staff` | clinic_owner | Staff management |
| GET/POST/DELETE | `/api/clinics/my/tests` | owner+staff | Test categories |

### Patients
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/patients/today` | Today's queue + stats |
| GET | `/api/patients/pndt` | PNDT register by month/year |
| GET | `/api/patients/activity` | Audit log |
| GET | `/api/patients/:id/full` | Patient + clinic (for A4 sheet) |
| POST | `/api/patients` | Register patient |
| PATCH | `/api/patients/:id/status` | Update queue status |

### F-Forms
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/fform` | All forms (clinic-scoped) |
| GET | `/api/fform/:id` | Single form (full populate) |
| POST | `/api/fform` | Create Form F |
| PATCH | `/api/fform/:id` | Update form |

### Bills
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/bills/stats` | Revenue stats |
| GET | `/api/bills` | Bills by date |
| POST | `/api/bills` | Create bill (with GST) |
| GET | `/api/bills/:id` | Single bill (full populate) |

### Referred Doctors
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/referred-doctors` | Clinic's saved doctors |
| POST | `/api/referred-doctors` | Save new doctor |
| GET | `/api/admin/referred-doctors/admin` | All clinics referral counts (admin) |

---

## Setup & First Run

### 1. Clone & Install
```bash
git clone https://github.com/princechouhan19/medirecord.git
cd medirecord
npm run install-all
```

### 2. Configure
```bash
cd backend && cp .env.example .env
```
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/medirecord
JWT_SECRET=your-64-char-random-string
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
IMAGEKIT_PUBLIC_KEY=your_key
IMAGEKIT_PRIVATE_KEY=your_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
RENDER_EXTERNAL_URL=https://medirecord-x0jg.onrender.com
```

### 3. Run locally
```bash
cd backend && npm run dev    # :5000
cd frontend && npm run dev   # :5173
```

## Deployment (Render)

| Setting | Value |
|---------|-------|
| Build Command | `npm run build` |
| Start Command | `npm start` |

Required env vars: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN=7d`, `NODE_ENV=production`, `RENDER_EXTERNAL_URL`.

---

## Version History

### v1 — Initial Release
Basic patient registration, simple dashboard, F-Form, JWT auth, single role.

### v2 — Multi-Clinic Architecture
3-tier roles (superadmin/clinic_owner/staff), subscription management, F-Form improvements, PNDT register.

### v3 — 4-Tier Role System + Core Features
lab_handler/receptionist roles, live queue, test fee manager, billing, PNDT 12-column, activity audit log.

### v4 — UI Polish + Landing Page
Login redesign, sidebar logo.png, mobile responsive layout, landing page with pricing, PDF export.

### v5 — Dashboard Upgrade + GST + Branches
8-stat clinic dashboard, GST billing (CGST/SGST/IGST), multi-branch clinics with revenue comparison, DB performance indexes, branch management page.

### v6 — Complete Patient Registration Overhaul
- **4-tab registration**: Patient Info / ID & Documents / Referral / Test & Payment
- **All PNDT fields**: DOB, relative type (6 options), living children M+F with ages, district/state/areaType, PCTS ID, patient reg date
- **ID Proof**: 10 types, front + back scan upload (JPG/PNG/PDF via ImageKit)
- **Referral Doctor**: saved doctor autocomplete, full details (qualification, reg no, address, phone), referral slip scan
- **Pregnancy tracking**: LMP → auto weeks/days/EDD, 10-milestone upcoming test schedule (FOGSI guidelines)
- **F-Form required toggle**: auto-ticked from sub-test configuration
- **ReferredDoctor model**: save doctors for reuse, admin aggregation for commission tracking
- **A4 Patient Record Sheet** (3-page): PNDT row + patient identity, ID proof images, report page — print from queue/patients/reception

### v6.1 — Complete Form F (PNDT Government Form)
- **Section A**: performing doctor, procedure date, declaration date, patient details from registration
- **Section B**: all 23 USG indication checkboxes (per PC & PNDT Act), procedure type, result brief, conveyed-to, MTP indication
- **Section C**: invasive procedures — performing doctor, family history, basis of diagnosis, all indication checkboxes, consent date (Form G), procedure types (Amniocentesis/CVS/Fetal Biopsy/Cordocentesis), complications, additional tests
- **Section D**: patient declaration text (English + Gujarati), thumb impression support with witness details
- **Clinical tab**: vitals, chief complaint, ICD-10 AI suggestion, history, diagnosis, prescriptions, follow-up
- **BranchesPage**: fixed gsap null crash, proper error display
- **Admin Dashboard**: referral doctor tracker with patient count per doctor (commission tracking)
- **README**: replaced SETUP.md with comprehensive README covering all versions

---

## Responsive Design

| Breakpoint | Layout |
|-----------|--------|
| `> 1024px` | Fixed sidebar |
| `769–1024px` | Sidebar + compact padding |
| `< 768px` | Mobile topbar + bottom nav + slide-in sidebar |

---

## Contributors

- **Lead Developer**: [Prince Chouhan](https://github.com/princechouhan19)
- **Live**: https://medirecord-x0jg.onrender.com

---

*MediRecord — Built for Indian Clinics* 🇮🇳
