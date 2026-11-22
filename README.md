# Code2Conquer Document Generator & Certificate Central Portal

**Internal Administration System for Code2Conquer Pvt. Ltd.**

This application is an internal corporate document generation and verification registration suite. Running locally on the administrator's computer, it produces pixel-perfect, high-resolution **Internship Offer Letters** and **Internship Completion Certificates** (with both **QR Code** and **Non-QR** options), while registering all issued certificates in a central online database (**MongoDB Atlas**) for future public verification.

---

## Architecture Overview

```
                                      +---------------------------------------------+
                                      |          Administrator Computer             |
                                      |                                             |
                                      |   [React + Vite Frontend (Port 5173)]       |
                                      |      ├── Live A4 Preview System             |
                                      |      ├── Offer Letter Generator             |
                                      |      ├── Certificate Generator (QR/Non-QR)  |
                                      |      └── Local PDF Download (.pdf)          |
                                      |                   |                         |
                                      +-------------------|-------------------------+
                                                          | HTTP REST (JWT Secured)
                                                          v
                                      +---------------------------------------------+
                                      |     Code2Conquer Central API (Port 5000)    |
                                      |        (Deployable independently)           |
                                      |                                             |
                                      |   POST /api/admin/certificates              |
                                      |   GET  /api/admin/certificates              |
                                      |   PATCH /api/admin/certificates/:id/revoke  |
                                      |   GET  /api/certificates/verify/:id (Public)|
                                      +---------------------------------------------+
                                                          |
                                                          v
                                      +---------------------------------------------+
                                      |             MongoDB Atlas Cluster           |
                                      |   - Atomic Counters (Unique C2C-INT IDs)   |
                                      |   - Certificate Records (VALID / REVOKED)   |
                                      |   - Document Audit History                  |
                                      +---------------------------------------------+
                                                          ^
                                                          |
                                                          | (Future Project 2)
                                      +---------------------------------------------+
                                      |        Public Verification Website          |
                                      |       https://verify.code2conquer.com       |
                                      +---------------------------------------------+
```

---

## 1. Prerequisites & Node.js Requirements

- **Node.js**: v18.12.0 or higher (LTS recommended)
- **npm**: v9.0.0 or higher
- **MongoDB**: MongoDB Atlas cloud cluster (or a local MongoDB instance for offline development)
- **Operating System**: Windows 10/11, macOS, or Linux

---

## 2. Directory Structure

```
Code2Conquer-Document-Generator/
├── backend/
│   ├── config/              # Environment config & MongoDB connection manager
│   ├── controllers/         # Business logic (Certificates, History, Auth, Settings, Stats)
│   ├── middleware/          # JWT auth, Zod validation, Rate limiters
│   ├── models/              # Mongoose schemas (Certificate, Counter, DocumentHistory, Settings)
│   ├── routes/              # Admin & Public API routes
│   ├── services/            # Atomic sequential ID generator service
│   ├── tests/               # Automated unit & integration verification tests
│   ├── utils/               # Schemas & logging utilities
│   ├── .env.example         # Example backend environment variables
│   ├── .env                 # Active local environment variables
│   ├── package.json
│   └── server.js            # Express API server entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Common UI, Offer Letter & Certificate forms/previews
│   │   ├── hooks/           # useAuth hook & context
│   │   ├── layouts/         # AdminLayout with responsive sidebar & navbar
│   │   ├── pages/           # Dashboard, Generators, Registry, History, Settings, Login
│   │   ├── services/        # API client, PDF generator (A4), Auth, Storage
│   │   ├── utils/           # High-res QR code generator, formatters, storage
│   │   ├── App.jsx          # React Router setup with protected routes
│   │   ├── index.css        # Tailwind CSS and A4 print styles
│   │   └── main.jsx
│   ├── public/              # SVG brand logos & symbols
│   ├── .env.example         # Example frontend environment variables
│   ├── .env                 # Active local environment variables
│   ├── index.html
│   ├── tailwind.config.js   # Code2Conquer Navy & Gold brand theme
│   ├── vite.config.js
│   └── package.json
│
├── templates/
│   ├── offer-letter/        # Offer letter template specifications
│   └── certificate/         # Certificate template specifications
│
├── generated-pdfs/
│   ├── offer-letters/       # Local generated offer letters
│   └── certificates/        # Local generated certificates
│
├── .gitignore
├── package.json             # Root package script runner
└── README.md
```

---

## 3. Installation & Setup

Open **Windows PowerShell** in the project root directory (`Code2Conquer-Document-Generator`):

### Step A: Install Backend Dependencies

```powershell
cd backend
npm install
cd ..
```

### Step B: Install Frontend Dependencies

```powershell
cd frontend
npm install
cd ..
```

### Step C: Configure Backend Environment Variables

Create or review `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/code2conquer?retryWrites=true&w=majority
ADMIN_JWT_SECRET=c2c_super_secret_jwt_admin_key_2026_change_in_production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_PASSWORD_HASH=
FRONTEND_ORIGIN=http://localhost:5173
PUBLIC_VERIFY_BASE_URL=https://verify.code2conquer.com
```

### Step D: Configure Frontend Environment Variables

Create or review `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## 4. MongoDB Atlas Configuration

To connect your live MongoDB Atlas cloud database:

1. **Create an Atlas Cluster**:
   - Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Create a free or dedicated cluster (e.g. `Cluster0`).

2. **Create a Database User**:
   - Go to **Security > Database Access**.
   - Click **Add New Database User**.
   - Choose **Password** authentication (e.g. username `c2c_admin`, secure password).
   - Assign `Read and write to any database` privileges.

3. **Whitelist Network Access**:
   - Go to **Security > Network Access**.
   - Click **Add IP Address**.
   - Add your current IP address (or `0.0.0.0/0` for development).

4. **Copy the Connection String**:
   - Go to **Database > Deployment > Connect**.
   - Select **Drivers (Node.js)**.
   - Copy the URI string:
     `mongodb+srv://c2c_admin:<password>@cluster0.xxxx.mongodb.net/code2conquer?retryWrites=true&w=majority`
   - Paste this into `backend/.env` as `MONGODB_URI`.

5. **Test the Connection**:
   - In the Administrator Settings page (`http://localhost:5173/settings`), click **"Test Connection"**.
   - A green confirmation badge will verify active connectivity.

---

## 5. Running the Application Locally

You can run the backend and frontend in separate PowerShell windows:

### Terminal 1: Run Backend API

```powershell
cd backend
npm run dev
```

*The backend starts at `http://localhost:5000`.*

### Terminal 2: Run Frontend UI

```powershell
cd frontend
npm run dev
```

*The frontend opens at `http://localhost:5173`.*

---

## 6. Administrator Login

1. Navigate to `http://localhost:5173` in your browser.
2. Sign in with the administrator credentials:
   - **Username**: `admin`
   - **Password**: `admin123` *(or the custom credentials set in `backend/.env`)*
3. Upon authentication, you will be redirected to the **Dashboard**.

---

## 7. Generating Documents

### A. Offer Letter Generation

1. Click **Generate Offer Letter** in the sidebar.
2. Fill in the candidate details:
   - Candidate Full Name
   - Offer Letter ID (Auto-suggested sequentially e.g. `C2C-OFF-2026-00001`, or editable)
   - Internship Domain (choose from list or enter custom domain)
   - Duration (1 Month, 2 Months, 3 Months, 6 Months, or custom duration)
   - Start Date & End Date (automatically calculated from duration)
   - Issue Date & Signatory Designation
3. Observe the **Live A4 Preview** update in real time. Use the zoom controls to adjust preview scale.
4. Click **Generate & Download PDF**.
5. The high-resolution A4 portrait PDF is automatically downloaded directly to your local computer.
6. The document is logged in **Document History**. Offer letters are never exposed on the public certificate verification database.

### B. Certificate Generation (QR & Non-QR)

1. Click **Generate Certificate** in the sidebar.
2. Choose **Certificate Type**:
   - **[ With QR Code ]**: Embeds a crisp QR code linking to `https://verify.code2conquer.com/verify/<Certificate-ID>`.
   - **[ Without QR Code ]**: Generates a clean certificate with the Certificate ID clearly displayed for manual verification.
3. Fill in candidate information and review the live A4 landscape preview.
4. Click **Issue & Register Certificate**.
5. **Issuance Workflow**:
   - All input fields are validated using Zod.
   - The backend atomically assigns or verifies the unique ID (`C2C-INT-YYYY-XXXXX`).
   - The record is registered in MongoDB Atlas with status `valid`.
   - Only upon database confirmation is the official PDF rendered and downloaded locally.
   - If database registration fails, no official certificate is issued.

---

## 8. Revoking Issued Certificates

If an internship is cancelled or revoked due to policy violations:

1. Go to **Issued Certificates** in the sidebar.
2. Find the candidate or search by **Certificate ID**.
3. Click the red **Revoke** action icon.
4. Enter the revocation reason (e.g., *Incomplete deliverables*).
5. Click **Confirm Revocation**.
6. The central database is updated immediately with `status: 'revoked'`.
7. Any subsequent public verification queries for that Certificate ID will immediately return `status: "REVOKED"`.

---

## 9. Central API Contract for Verification Website

The backend is built to serve as the standalone certificate verification engine for the future public verification portal.

### Public Verification Endpoint

```http
GET /api/certificates/verify/:certificateId
```

- **Rate Limited**: 60 requests/minute per IP.
- **Strictly Sanitized**: Never returns internal MongoDB IDs (`_id`), admin secrets, candidate emails, or database details.

#### Responses

**1. Valid Certificate (HTTP 200)**:
```json
{
  "status": "VALID",
  "certificate": {
    "certificateId": "C2C-INT-2026-00125",
    "holderName": "Aarav Sharma",
    "domain": "Full Stack Development",
    "duration": "3 Months",
    "startDate": "2026-06-01",
    "completionDate": "2026-08-31",
    "issueDate": "2026-08-31"
  }
}
```

**2. Revoked Certificate (HTTP 200)**:
```json
{
  "status": "REVOKED",
  "certificateId": "C2C-INT-2026-00125"
}
```

**3. Non-Existent Certificate (HTTP 404)**:
```json
{
  "status": "NOT_FOUND"
}
```

---

## 10. Deploying on Render (Frontend + Backend) & Vercel Portal Integration

The project includes pre-configured Render deployment manifests (`render.yaml`), production build optimizations, and automated CORS compatibility with the live **Vercel Certificate Verification Portal** (`https://c2c-verification-portal.vercel.app/`).

### Option A: One-Click Render Blueprint Deployment
1. Push your repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com/), click **New +** → **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect `render.yaml` and configure both the **Backend Web Service** and **Frontend Static Site**.
5. When prompted, fill in the secret environment variables (`MONGODB_URI` and `ADMIN_PASSWORD`).

---

### Option B: Manual Service Creation on Render

#### 1. Backend Web Service
1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Name**: `code2conquer-document-generator-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
4. In **Advanced** → **Environment Variables**, add:
   - `PORT`: `5000` (or leave default for Render to assign)
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `mongodb+srv://donotreplycode2conquer_db_user:<PASSWORD>@code2conquer.64b9cdm.mongodb.net/code2conquer?retryWrites=true&w=majority`
   - `ADMIN_JWT_SECRET`: *(A secure 32+ character random string)*
   - `ADMIN_USERNAME`: `admin`
   - `ADMIN_PASSWORD`: `admin123` *(or your custom secure password)*
   - `FRONTEND_ORIGIN`: `https://c2c-verification-portal.vercel.app,https://<YOUR_RENDER_FRONTEND_URL>.onrender.com`
   - `PUBLIC_VERIFY_BASE_URL`: `https://c2c-verification-portal.vercel.app`
5. Set **Health Check Path** to: `/api/health`
6. Click **Create Web Service**. Note your backend URL (e.g. `https://code2conquer-document-generator-backend.onrender.com`).

#### 2. Frontend Static Site
1. In Render Dashboard, click **New +** → **Static Site**.
2. Connect the same repository.
3. Configure:
   - **Name**: `code2conquer-document-generator-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. In **Redirects / Rewrites**, add an SPA rewrite rule (already included in `frontend/public/_redirects`):
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
5. In **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://<YOUR_BACKEND_SERVICE_NAME>.onrender.com`
   - `VITE_VERIFICATION_PORTAL_URL`: `https://c2c-verification-portal.vercel.app`
6. Click **Create Static Site**.

---

### Verification Portal Integration (Vercel)
The separate Verification Portal is live at `https://c2c-verification-portal.vercel.app/`.
- The deployed Render backend accepts requests from the Vercel portal with permissive CORS headers on `GET /api/certificates/verify/:certificateId`.
- Both QR-enabled and non-QR certificates registered through the Document Generator can be verified immediately through the Vercel portal.
- On Vercel, set the project's `VITE_API_BASE_URL` environment variable to your deployed Render backend URL (`https://<YOUR_BACKEND_NAME>.onrender.com`).

---

## 11. Security & Quality Assurance

- **Input Sanitization & Validation**: Form fields strictly validated on frontend and backend using Zod.
- **Atomic Concurrency Protection**: Sequential certificate IDs generated using MongoDB atomic `$inc` counters to avoid collisions.
- **Idempotency Keys**: Requests send a unique `clientRequestId` so network retries never duplicate certificates.
- **Rate Limiting**: Protected with `express-rate-limit` against brute-force attacks and verification scraping.
- **Local PDF Storage**: All generated PDFs stay strictly on the administrator's computer in `generated-pdfs/` and downloads folder.
- **Security Headers**: Hardened with HTTP `helmet` headers.
- **Zero Mock Data in Production**: Unregistered certificates are never claimed to be valid.

---

## License & Proprietary Information

Proprietary software developed exclusively for **Code2Conquer Pvt. Ltd.**  
All rights reserved. Unauthorized copying or redistribution is strictly prohibited.
