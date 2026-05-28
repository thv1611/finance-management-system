# Deployment Guide

This guide explains how to reproduce the Finance Management System locally and how to deploy it publicly. The project has two deployable parts:

- `Backend`: Express API server and PostgreSQL database connection.
- `Frontend`: React/Vite single-page application.

## 1. Local Reproduction

### Backend

1. Install dependencies:

```bash
cd Backend
npm install
```

2. Create the backend environment file:

```bash
cp .env.example .env
```

3. Fill in required values:

```text
DATABASE_URL
MAIL_HOST
MAIL_PORT
MAIL_USER
MAIL_PASS
MAIL_FROM
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
JWT_ACCESS_EXPIRES
JWT_REFRESH_EXPIRES
```

4. Start the backend:

```bash
npm run dev
```

Expected local URL:

```text
http://localhost:5000
```

The backend runs database schema initialization on startup.

### Frontend

1. Install dependencies:

```bash
cd Frontend
npm install
```

2. Create the frontend environment file:

```bash
cp .env.example .env
```

3. Fill in the API URL:

```text
VITE_API_BASE_URL=http://localhost:5000/api
```

4. Start the frontend:

```bash
npm run dev
```

Expected local URL:

```text
http://localhost:5173
```

## 2. Public Deployment Option

Recommended deployment split:

- Backend: Render, Railway, Fly.io, or similar Node.js host.
- Database: Managed PostgreSQL such as Neon, Supabase, Railway PostgreSQL, or Render PostgreSQL.
- Frontend: Vercel or Netlify.

### Backend deployment

Use these settings:

```text
Root directory: Backend
Build command: npm install
Start command: npm start
```

Set backend environment variables in the hosting dashboard:

```text
PORT=<provided by host or 5000>
APP_BASE_URL=https://<backend-domain>
DATABASE_URL=postgresql://...

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=<smtp user>
MAIL_PASS=<smtp app password>
MAIL_FROM=Finance Management <your-email@example.com>

JWT_ACCESS_SECRET=<long random string>
JWT_REFRESH_SECRET=<different long random string>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

OTP_EXPIRES_MINUTES=5
OTP_RESEND_COOLDOWN_SECONDS=60

GOOGLE_CLIENT_ID=<optional Google client id>
GOOGLE_CLIENT_SECRET=<optional Google client secret>

AI_PROVIDER=gemini
AI_FALLBACK_ENABLED=true
GEMINI_API_KEY=<optional>
GEMINI_MODEL=gemini-2.5-flash
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
```

If no real AI key is available, keep `AI_FALLBACK_ENABLED=true`. The AI page will still use app-side finance insights.

### Frontend deployment

Use these settings:

```text
Root directory: Frontend
Build command: npm run build
Output directory: dist
```

Set frontend environment variables:

```text
VITE_API_BASE_URL=https://<backend-domain>/api
VITE_GOOGLE_CLIENT_ID=<same Google client id if Google Sign-In is enabled>
```

After changing `VITE_*` variables, redeploy the frontend because Vite embeds these values at build time.

## 3. Post-Deployment Verification

Verify these flows on the deployed frontend:

1. Open the frontend public URL.
2. Register a new account.
3. Receive and enter OTP verification.
4. Log in.
5. Create income and expense transactions.
6. Create a monthly category budget.
7. Check dashboard values.
8. Open reports and export CSV.
9. Ask AI Insights a finance question.
10. Log out and log in again.

## 4. Known Deployment Notes

- `.env` files must never be committed or submitted.
- `node_modules`, `dist`, logs, and local upload folders should not be included in the source package.
- Receipt uploads use local backend storage. This is acceptable for a course demo, but persistent production deployment should move files to object storage.
- If Google Sign-In is enabled, configure the Google OAuth client for the deployed frontend origin.
- If SMTP email does not work, OTP and reset-password flows cannot be completed. Use an app password or verified SMTP provider.

## 5. Final Submission Packaging

The source package in the final zip should include:

```text
Group_<GroupNumber>_<ProjectName>_source_code/
|-- README.md
|-- Backend/
|-- Frontend/
|-- DEPLOY.md
|-- DEMO_SCRIPT.md
|-- REPORT.md
`-- .gitignore
```

The source package should include `.env.example` files but not real `.env` files.
