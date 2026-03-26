# chainlock

# ChainLock — Secure Digital Evidence Collection System

**CYB 305 - Digital Forensics | Group 6 | March 2026**

---

## Table of Contents

1. [What is ChainLock?](#what-is-chainlock)
2. [Why We Built It This Way](#why-we-built-it-this-way)
3. [System Architecture](#system-architecture)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Prerequisites](#prerequisites)
7. [Setup and Installation](#setup-and-installation)
8. [Running the Project](#running-the-project)
9. [Environment Variables](#environment-variables)
10. [API Reference](#api-reference)
11. [How Each Feature Works](#how-each-feature-works)
12. [The Expert System Explained](#the-expert-system-explained)
13. [Demo Walkthrough](#demo-walkthrough)
14. [Task Breakdown and Who Owns What](#task-breakdown-and-who-owns-what)
15. [Git Workflow](#git-workflow)

---

## What is ChainLock?

ChainLock is a full-stack web application built for secure digital evidence management in forensic investigations. It solves a critical problem in digital forensics: **how do you prove that a piece of digital evidence has not been tampered with between the time it was collected and the time it is presented?**

ChainLock does this by:

- Computing a **SHA-256 cryptographic hash** of every uploaded file at submission time and storing it permanently
- Running an **AI expert system** that automatically analyses the file for signs of manipulation or anomalies
- Enforcing a **two-actor verification rule** — the person who submitted evidence cannot verify it (prevents self-certification)
- Maintaining an **immutable audit trail** of every action taken on every piece of evidence
- Allowing a verifier to **recompute the hash** at any time and compare it to the stored hash — any modification to the file will produce a different hash, immediately flagging it as tampered

---

## Why We Built It This Way

### Why SHA-256 hashing?

SHA-256 is a one-way cryptographic hash function. Given the same file, it always produces the same 64-character hex string. If even one byte of the file changes, the hash changes completely. This makes it a reliable fingerprint for detecting tampering.

Example:

```
Original file hash:  4803f3b0cd2160445fc4709412d0b995edfdf3cf4d031c52c61afd29f8053b7b
Tampered file hash:  9f2b1a7c3e8d4f6a0b5c2e9d7a3f1b8c4e7d2a5f9b3c6e0d8a4f7b1c5e2d9a6f
```

### Why JWT authentication?

JSON Web Tokens allow stateless authentication. The server signs a token containing the user's ID, name, email and role. Every request after login includes this token. The server verifies the signature without needing to hit the database on every request.

### Why the two-actor rule?

This is standard forensic procedure. The officer who collected evidence cannot also be the one who certifies its integrity — that would be a conflict of interest. ChainLock enforces this programmatically with a 409 Conflict response.

### Why an append-only audit trail?

Audit events are never updated or deleted. Once written, they are permanent. This ensures a trustworthy, complete chain of custody that cannot be retroactively altered.

### Why an expert system instead of ML?

The requirement specifies no external APIs or services. The expert system runs entirely in-process using only Node.js built-ins. Rule-based systems are also more explainable — you can tell exactly which rule fired and why, which matters in a forensic context.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (React)                      │
│  Login  │  Register  │  Upload  │  Evidence List/Detail  │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP (Axios + JWT Bearer token)
┌──────────────────────────▼──────────────────────────────┐
│                   SERVER (Express + TypeScript)          │
│                                                         │
│  /api/auth      → AuthController                        │
│  /api/evidence  → EvidenceController                    │
│                      │                                  │
│              ┌───────┴────────┐                         │
│          HashService    ExpertSystem                     │
│          (SHA-256)      (Rule Engine)                   │
│              │               │                          │
│          AuditService ←──────┘                          │
│              │                                          │
└──────────────┼──────────────────────────────────────────┘
               │ Mongoose ODM
┌──────────────▼──────────────────────────────────────────┐
│                     MongoDB                              │
│   Users │ EvidenceRecords │ AuditEvents                 │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer          | Technology               | Purpose                                |
| -------------- | ------------------------ | -------------------------------------- |
| Frontend       | React 18 + TypeScript    | User interface                         |
| Frontend Build | Vite                     | Fast dev server and bundler            |
| HTTP Client    | Axios                    | API calls from frontend                |
| Routing        | React Router v6          | Client-side page routing               |
| Backend        | Node.js + Express        | REST API server                        |
| Language       | TypeScript (end-to-end)  | Type safety across client and server   |
| Database       | MongoDB + Mongoose       | Document storage                       |
| Authentication | JWT + bcryptjs           | Stateless auth, password hashing       |
| File Uploads   | Multer                   | Multipart form handling                |
| Shared Types   | `/shared/types/index.ts` | Single source of truth for data models |

---

## Project Structure

```
chainlock/
├── package.json                  ← Root workspace controller
├── README.md                     ← This file
│
├── shared/
│   └── types/
│       └── index.ts              ← Shared TypeScript interfaces (User, EvidenceRecord, AuditEvent, etc.)
│
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example              ← Copy this to .env and fill in values
│   └── src/
│       ├── index.ts              ← Express app entry point
│       ├── config/
│       │   └── multerConfig.ts   ← File upload configuration
│       ├── controllers/
│       │   ├── authController.ts     ← Register, login logic
│       │   └── evidenceController.ts ← Submit, list, detail, verify logic
│       ├── middleware/
│       │   ├── requireAuth.ts    ← JWT verification middleware
│       │   └── requireRole.ts    ← Role-based access control
│       ├── models/
│       │   ├── User.ts           ← Mongoose User schema
│       │   ├── EvidenceRecord.ts ← Mongoose EvidenceRecord schema
│       │   └── AuditEvent.ts     ← Mongoose AuditEvent schema (append-only)
│       ├── routes/
│       │   ├── authRoutes.ts     ← POST /register, POST /login
│       │   └── evidenceRoutes.ts ← Evidence CRUD + verify + audit endpoints
│       ├── services/
│       │   ├── hashService.ts        ← SHA-256 hash computation and verification
│       │   ├── auditService.ts       ← Write and retrieve audit events
│       │   └── expertSystem/
│       │       ├── index.ts          ← Main ExpertSystem entry point
│       │       ├── types.ts          ← Rule and FileMeta interfaces
│       │       ├── utils.ts          ← File header reading, entropy, MIME detection
│       │       ├── inferenceEngine.ts ← Verdict and score computation
│       │       └── rules/
│       │           ├── imageRules.ts     ← Rules for .jpg, .jpeg, .png, .gif
│       │           ├── textRules.ts      ← Rules for .txt, .log, .csv
│       │           └── documentRules.ts  ← Rules for .pdf, .docx
│       └── types/
│           └── express.d.ts      ← Extends Express Request with req.user
│
└── client/
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── App.tsx               ← Route definitions
        ├── context/
        │   └── AuthContext.tsx   ← Global auth state (token + user)
        ├── services/
        │   ├── api.ts            ← Axios instance with auth interceptor
        │   ├── authService.ts    ← Login, register API calls
        │   └── evidenceService.ts ← Evidence API calls
        ├── pages/
        │   ├── LoginPage.tsx
        │   ├── RegisterPage.tsx
        │   ├── UploadPage.tsx
        │   ├── EvidenceListPage.tsx
        │   └── EvidenceDetailPage.tsx
        └── components/
            ├── NavBar.tsx
            ├── ProtectedRoute.tsx
            ├── HashDisplay.tsx
            ├── IntegrityBadge.tsx
            ├── ExpertSystemPanel.tsx
            ├── VerificationPanel.tsx
            ├── VerificationResult.tsx
            ├── AuditTimeline.tsx
            └── ErrorBoundary.tsx
```

---

## Prerequisites

Make sure you have the following installed before setting up the project:

- **Node.js 18 or higher** — https://nodejs.org
  - Check: `node --version`
- **npm 8 or higher** (comes with Node.js)
  - Check: `npm --version`
- **MongoDB running locally** — https://www.mongodb.com/try/download/community
  - On Windows: `net start MongoDB`
  - On Mac: `brew services start mongodb-community`
  - On Linux: `sudo systemctl start mongod`
  - Check: `mongosh` should open a shell without errors
- **Git** — https://git-scm.com

---

## Setup and Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/chainlock.git
cd chainlock
```

### 2. Install all dependencies

Run this from the **root** `chainlock/` folder. npm workspaces installs dependencies for all three packages (client, server, shared) at once:

```bash
npm install
```

### 3. Set up environment variables

```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in the values (see Environment Variables section below).

---

## Running the Project

You need **two terminals** — one for the server and one for the client.

**Terminal 1 — Start the backend server:**

```bash
cd server
npm run dev
```

You should see:

```
ChainLock server running on port 5000
Connected to MongoDB
```

**Terminal 2 — Start the frontend client:**

```bash
cd client
npm run dev
```

You should see:

```
  VITE v5.x.x  ready in Xms
  ➜  Local:   http://localhost:5173/
```

Open your browser and go to `http://localhost:5173`

---

## Environment Variables

Create `server/.env` by copying `server/.env.example`. The file should contain:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chainlock
JWT_SECRET=your_super_secret_key_here
UPLOAD_DIR=uploads
```

| Variable      | Description                                                                        |
| ------------- | ---------------------------------------------------------------------------------- |
| `PORT`        | Port the Express server listens on (default: 5000)                                 |
| `MONGODB_URI` | MongoDB connection string. Use `mongodb://localhost:27017/chainlock` for local dev |
| `JWT_SECRET`  | Secret key used to sign and verify JWTs. Use a long random string in production    |
| `UPLOAD_DIR`  | Directory where uploaded evidence files are saved (default: `uploads`)             |

**Important:** Never commit `.env` to git. It is listed in `.gitignore`.

---

## API Reference

All endpoints except `/api/auth/register` and `/api/auth/login` require a valid JWT in the `Authorization` header:

```
Authorization: Bearer <token>
```

### Authentication

| Method | Endpoint             | Auth | Role | Description           |
| ------ | -------------------- | ---- | ---- | --------------------- |
| POST   | `/api/auth/register` | None | —    | Register a new user   |
| POST   | `/api/auth/login`    | None | —    | Login and receive JWT |

**Register request body:**

```json
{
  "fullName": "Officer Davies",
  "email": "davies@chainlock.com",
  "password": "password123",
  "role": "submitter",
  "badgeNumber": "B-001"
}
```

**Login response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "fullName": "Officer Davies",
    "email": "davies@chainlock.com",
    "role": "submitter"
  }
}
```

### Evidence

| Method | Endpoint                           | Auth | Role      | Description                  |
| ------ | ---------------------------------- | ---- | --------- | ---------------------------- |
| POST   | `/api/evidence?caseId=CS-2026-001` | JWT  | submitter | Upload a file as evidence    |
| GET    | `/api/evidence`                    | JWT  | any       | List all evidence records    |
| GET    | `/api/evidence/:id`                | JWT  | any       | Get a single evidence record |
| POST   | `/api/evidence/:id/verify`         | JWT  | verifier  | Verify evidence integrity    |
| GET    | `/api/evidence/:id/audit`          | JWT  | any       | Get audit trail for evidence |

**Upload request:** `multipart/form-data`

- `file` — the evidence file (max 20MB, accepted types: jpg, jpeg, png, gif, pdf, docx, txt, log, csv)
- `notes` — optional text notes
- `caseId` — required query parameter

**Verify response:**

```json
{
  "status": "verified",
  "computedHash": "4803f3b0cd2160...",
  "storedHash": "4803f3b0cd2160...",
  "match": true
}
```

### HTTP Status Codes Used

| Code | Meaning                                                 |
| ---- | ------------------------------------------------------- |
| 200  | Success                                                 |
| 201  | Resource created                                        |
| 400  | Bad request (missing or invalid fields)                 |
| 401  | Unauthorized (no token or invalid token)                |
| 403  | Forbidden (wrong role)                                  |
| 404  | Resource not found                                      |
| 409  | Conflict (duplicate email, or two-actor rule violation) |
| 413  | File too large (exceeds 20MB)                           |
| 500  | Internal server error                                   |

---

## How Each Feature Works

### 1. Authentication (TASK-1A / TASK-1B)

When a user registers, their password is hashed using **bcrypt with cost factor 12** before being stored. The plain text password is never saved anywhere.

When a user logs in, bcrypt compares the submitted password against the stored hash. If valid, the server signs a **JWT** containing `userId`, `fullName`, `email`, and `role`, which expires after 8 hours.

Every protected request goes through `requireAuth` middleware which verifies the JWT signature. Role-restricted routes additionally go through `requireRole` middleware.

The frontend stores the token **in memory only** (React AuthContext state), never in localStorage, for security.

### 2. Evidence Submission (TASK-2A / TASK-2B)

When a file is uploaded:

1. Multer saves the file to `uploads/{caseId}/{evidenceId}/{originalFilename}`
2. A SHA-256 hash is computed from the saved file using Node.js `crypto`
3. The expert system analyses the file and returns a verdict
4. An EvidenceRecord is saved to MongoDB with the hash and verdict (both immutable after creation)
5. A `SUBMITTED` audit event is written

### 3. Expert System Analysis (TASK-3)

The expert system runs entirely in-process — no external APIs. It selects the appropriate rule set based on the file extension and evaluates all rules in parallel. See The Expert System Explained section below.

### 4. Verification (TASK-4A / TASK-4B)

When a verifier clicks Verify:

1. The two-actor rule is checked — if the verifier is the submitter, HTTP 409 is returned
2. The SHA-256 hash is recomputed from the file on disk (never from cache)
3. The computed hash is compared to the stored hash
4. `integrityStatus` is updated to `verified` or `tampered`
5. A `VERIFIED` or `TAMPER_DETECTED` audit event is written with both hash values

### 5. Audit Trail (TASK-5A / TASK-5B)

Every significant action produces an immutable AuditEvent:

| Event Type        | When it fires                      |
| ----------------- | ---------------------------------- |
| `SUBMITTED`       | File uploaded successfully         |
| `ACCESSED`        | Evidence detail page viewed        |
| `VERIFIED`        | Hash recomputed and matches        |
| `TAMPER_DETECTED` | Hash recomputed and does not match |

Audit events are **never updated or deleted**. No PUT, PATCH or DELETE endpoints exist for AuditEvent.

---

## The Expert System Explained

The expert system is a **rule-based inference engine** — a core concept in Artificial Intelligence. It mirrors the reasoning process a human forensic analyst would apply when inspecting a file.

### How it works

1. The file extension determines which rule set is loaded (image, text, or document rules)
2. All rules are evaluated in parallel using `Promise.all`
3. Rules that trigger are collected
4. The **inference engine** applies verdict logic to produce a final assessment

### Rules

**Image rules** (`.jpg`, `.jpeg`, `.png`, `.gif`):

| Rule ID                       | Severity | What it checks                                                                                                                                                                                              |
| ----------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FILE_HEADER_MISMATCH`        | HIGH     | Reads the first 8 bytes of the file. Every file format has a known magic number — e.g. JPEG files always start with `FFD8FF`. If the header does not match the extension, the file may have been disguised. |
| `EXIF_TIMESTAMP_ANOMALY`      | MEDIUM   | JPEG files embed EXIF metadata including when the photo was taken. If the EXIF date is more than 30 days from today, this is flagged.                                                                       |
| `FILE_SIZE_ANOMALY`           | LOW      | Flags files that are suspiciously small (under 1KB) or suspiciously large (over 15MB) for an image.                                                                                                         |
| `EXTENSION_MIMETYPE_MISMATCH` | MEDIUM   | Similar to header mismatch but from a MIME type perspective.                                                                                                                                                |

**Text/Log rules** (`.txt`, `.log`, `.csv`):

| Rule ID                       | Severity | What it checks                                                                                                                                                                                            |
| ----------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SUSPICIOUS_KEYWORD_DETECTED` | HIGH     | Scans the file for keywords associated with malicious activity: `sudo`, `rm -rf`, `unauthorized`, `failed login`, `exec`, `eval`, etc.                                                                    |
| `TIMESTAMP_INCONSISTENCY`     | MEDIUM   | Parses timestamps in log files. If any timestamp is earlier than the previous one, the log may have been manually edited.                                                                                 |
| `ENTROPY_ANOMALY`             | LOW      | Computes Shannon entropy of the file content. Normal text has entropy between 2.0 and 6.5 bits per character. Values outside this range may indicate encrypted, compressed, or highly repetitive content. |
| `LINE_COUNT_ANOMALY`          | LOW      | A file larger than 100KB with fewer than 10 lines is suspicious — normal log files have many lines.                                                                                                       |

**Document rules** (`.pdf`, `.docx`):

| Rule ID                       | Severity | What it checks                                                                                                            |
| ----------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `FILE_HEADER_MISMATCH`        | HIGH     | PDF files must start with `%PDF` (hex `25504446`). DOCX files are ZIP archives and must start with `PK` (hex `504B0304`). |
| `EXTENSION_MIMETYPE_MISMATCH` | MEDIUM   | Compares detected MIME against declared extension.                                                                        |
| `SUSPICIOUS_KEYWORD_DETECTED` | HIGH     | Reads the first 50KB of the document as UTF-8 and scans for suspicious keywords.                                          |

### Inference Engine (Verdict Logic)

```
IF any triggered rule has severity HIGH  → verdict = HIGH_RISK
IF 3 or more rules triggered             → verdict = HIGH_RISK
IF 1 or 2 rules triggered                → verdict = SUSPICIOUS
IF no rules triggered                    → verdict = CLEAN
```

This mirrors **forward chaining** in expert systems — facts (triggered rules) are matched against condition-action rules to reach a conclusion (verdict).

### Scoring

Each triggered rule contributes to a numeric score:

- LOW = 1 point
- MEDIUM = 2 points
- HIGH = 3 points

The total score is stored alongside the verdict on the evidence record.

---

## Demo Walkthrough

Follow these steps to demonstrate the full system end-to-end:

### Step 1 — Register users

Register a submitter:

```json
POST /api/auth/register
{ "fullName": "Officer Davies", "email": "davies@chainlock.com", "password": "password123", "role": "submitter", "badgeNumber": "B-001" }
```

Register a verifier:

```json
POST /api/auth/register
{ "fullName": "Analyst Chen", "email": "chen@chainlock.com", "password": "password123", "role": "verifier", "badgeNumber": "B-002" }
```

### Step 2 — Submit evidence

Login as Davies, upload a crime scene JPEG with `caseId=CS-2026-001`. Observe the SHA-256 hash and expert system verdict in the response.

### Step 3 — Verify integrity (clean)

Login as Chen, navigate to the evidence, click Verify. The hash is recomputed from disk and matches the stored hash. Status updates to `verified`. The audit trail now shows `SUBMITTED` and `VERIFIED` events.

### Step 4 — Simulate tampering

Locate the uploaded file in `server/uploads/CS-2026-001/{evidenceId}/`. Open it in a text editor, add any character, and save.

### Step 5 — Detect tampering

Login as Chen again, verify the same evidence. The recomputed hash no longer matches. Status updates to `tampered`. The audit trail shows a `TAMPER_DETECTED` event with both hash values for comparison.

### Step 6 — Two-actor rule demonstration

Login as Davies and attempt to verify evidence that Davies submitted. The system returns HTTP 409 with a conflict of interest message.

---

## Task Breakdown and Who Owns What

| Task    | Description                                            | Owner               |
| ------- | ------------------------------------------------------ | ------------------- |
| TASK-0  | Monorepo setup, shared types, project config           | All (Day 1 morning) |
| TASK-1A | Auth backend — register, login, JWT, middleware        | Backend             |
| TASK-1B | Auth frontend — login page, register page, AuthContext | Frontend            |
| TASK-2A | Evidence backend — upload, hash, models, endpoints     | Backend             |
| TASK-2B | Evidence frontend — upload form, list, detail shell    | Frontend            |
| TASK-3  | Expert system — rules, inference engine                | Backend             |
| TASK-4A | Verification backend — two-actor, hash recompute       | Backend             |
| TASK-4B | Verification frontend — verify button, result panel    | Frontend            |
| TASK-5A | Audit trail backend — GET endpoint                     | Backend             |
| TASK-5B | Audit trail frontend — timeline component              | Frontend            |
| TASK-6  | Integration, error handling, demo prep                 | All (Day 5)         |

---

## Git Workflow

### Branch naming

```
feat/task-0-foundation
feat/task-1a-auth-backend
feat/task-1b-auth-frontend
feat/task-2a-evidence-backend
feat/task-2b-evidence-frontend
feat/task-3-expert-system
feat/task-4a-verification-backend
feat/task-4b-verification-frontend
feat/task-5a-audit-backend
feat/task-5b-audit-frontend
feat/task-6-integration
```

### Commit message format

```
type(scope): short description
```

Types: `feat`, `fix`, `chore`, `refactor`, `docs`

Examples:

```bash
git commit -m "feat(auth): add register and login endpoints"
git commit -m "feat(expert-system): implement inference engine"
git commit -m "fix(evidence): handle multer file size error correctly"
git commit -m "chore(task-0): initialize monorepo with npm workspaces"
```

### Daily workflow

```bash
# Start of day — pull latest
git checkout main
git pull origin main
git checkout feat/your-task-branch

# During work — commit in small logical chunks
git add .
git commit -m "feat(scope): what you just completed"

# End of session — push your branch
git push origin feat/your-task-branch
```

---

_ChainLock — Group 6 — CYB 305 Digital Forensics — Nnamdi Azikiwe University — 2026_
