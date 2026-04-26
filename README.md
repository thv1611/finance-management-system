# Finance Management System

Full-stack personal finance management web app with transaction tracking, monthly budgets, reports, and AI-powered financial insights.

## Highlights

- Track income and expense transactions with category filters and receipt support
- Set monthly category budgets and monitor overspending risk
- Explore reports for spending breakdown, top categories, and time-based comparisons
- Ask AI for savings suggestions and personalized financial insights from real app data
- Export report data to CSV for sharing or submission

## Tech Stack

- Frontend: React, Vite, React Router, Tailwind CSS
- Backend: Node.js, Express
- Database: PostgreSQL (Neon-compatible)
- Auth: JWT access/refresh tokens, Google Sign-In
- Email: Nodemailer OTP and reset-password flow
- AI: Gemini or OpenAI, with app-side fallback insights

## Project Structure

```text
.
├── Backend
│   ├── src
│   │   ├── config
│   │   ├── data
│   │   ├── db
│   │   ├── middlewares
│   │   ├── modules
│   │   └── utils
│   └── package.json
├── Frontend
│   ├── src
│   │   ├── components
│   │   ├── hooks
│   │   ├── lib
│   │   └── pages
│   └── package.json
└── README.md
```

## Main Features

### Authentication

- Register with email and password
- Email OTP verification
- Login / logout
- Forgot password and reset password
- Google Sign-In

### Transactions

- Create, edit, delete transactions
- Category-based organization
- Search and filter by type/date/category
- Receipt-ready transaction model

### Budgets

- Create monthly category budgets
- Track spent vs. limit
- Identify near-limit and overspent categories

### Reports

- Income vs. expense summary
- Spending by category
- Monthly comparison trend
- Top spending categories
- CSV export

### AI Insights

- Chat grounded in the user’s own finance data
- Personalized saving and budget guidance
- Graceful fallback when model/provider is unavailable

## Local Setup

### 1. Install dependencies

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

### 2. Configure environment variables

Copy the example files and fill in real values:

```bash
Backend/.env.example   -> Backend/.env
Frontend/.env.example  -> Frontend/.env
```

### 3. Start the backend

```bash
cd Backend
npm run dev
```

Backend default URL:

```text
http://localhost:5000
```

### 4. Start the frontend

```bash
cd Frontend
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

## Available Scripts

### Backend

```bash
npm run dev
npm start
```

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Environment Notes

### Backend required basics

- `DATABASE_URL`
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES`, `JWT_REFRESH_EXPIRES`

### Frontend required basics

- `VITE_API_BASE_URL`
- `VITE_GOOGLE_CLIENT_ID`

### Optional AI / deploy variables

- `APP_BASE_URL`
- `AI_PROVIDER`
- `GEMINI_API_KEY` / `OPENAI_API_KEY`
- `AI_SQL_*` variables if the SQL agent service is enabled

## Verification Completed

Recent validation performed in this workspace:

- Frontend build: pass
- Frontend lint: pass
- Backend module load: pass
- End-to-end API smoke test:
  - register / verify / login / logout
  - forgot password / reset password / change password
  - transactions CRUD
  - budgets create/list
  - dashboard endpoints
  - reports endpoints
  - AI chat
  - CSV export

## Submission Tips

- Use a seeded demo account with realistic transactions and budgets
- Show dashboard -> reports -> AI chat -> export CSV in one clean flow
- Keep `Backend/.env` and `Frontend/.env` out of version control
- Rotate exposed secrets before publishing the repository

## Related Docs

- [Backend env example](./Backend/.env.example)
- [Frontend env example](./Frontend/.env.example)
- [Demo script](./DEMO_SCRIPT.md)
- [Deploy notes](./DEPLOY.md)
