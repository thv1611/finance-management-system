# Finance Management System

## Overview

Finance Management System is a full-stack personal finance management web application. It is designed for individual users who want to track income, expenses, monthly budgets, spending patterns, and financial reports from one web interface.

The application solves the common problem of scattered personal finance records by combining transaction management, category-based budgeting, dashboard summaries, CSV reports, and AI-assisted financial insights in a single system.

## Features

- User registration with email OTP verification.
- Login, logout, forgot password, reset password, and email-based password reset OTP.
- JWT authentication with short-lived access tokens and refresh tokens.
- Optional Google Sign-In when Google OAuth credentials are configured.
- Profile management, including profile updates and password changes.
- Income and expense transaction management.
- Transaction search, pagination, category filtering, type filtering, and date filtering.
- Receipt image attachment storage for transactions using local backend storage.
- Optional AI receipt scanning and natural-language quick entry parsing when Gemini or OpenAI is configured.
- Category listing with default income and expense categories.
- Monthly category budget creation, update, deletion, progress tracking, and overspending detection.
- Dashboard summaries for balance, monthly income, monthly expenses, monthly savings, recent transactions, budget snapshot, and spending analytics.
- Reports for income/expense summary, spending by category, monthly comparison, and top spending.
- CSV export for report data.
- AI Insights chat using the user's dashboard, transaction, budget, and report context.
- AI fallback responses when no provider key is configured or when a provider request fails.
- Optional AI SQL agent microservice for database-backed finance questions if separately enabled.

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Tailwind CSS
- ESLint

### Backend

- Node.js 18+
- Express 5
- CommonJS modules
- `express-validator`
- `pg` PostgreSQL client
- `bcryptjs`
- `jsonwebtoken`
- `nodemailer`
- `google-auth-library`

### Database

- PostgreSQL
- SQL schema initialization from `Backend/src/db/schema.sql`
- Automatic default category seeding on backend startup

### Authentication

- Email/password authentication
- Email OTP verification
- Password reset OTP
- JWT access tokens and refresh tokens
- Refresh token persistence and revocation
- Optional Google OAuth sign-in

### Email Service

- Brevo API when `BREVO_API_KEY` is configured
- SMTP fallback through Nodemailer when Brevo is not configured

### AI Integration

- Gemini API support
- OpenAI API support
- Application fallback insight logic
- Optional FastAPI AI SQL agent service using LangChain, OpenAI or Gemini, PostgreSQL, and SQL safety checks

### Deployment

- Backend can be deployed to a Node.js host such as Render, Railway, Fly.io, or similar.
- Database can be deployed to a managed PostgreSQL provider such as Neon, Supabase, Railway PostgreSQL, or Render PostgreSQL.
- Frontend is configured for Vercel-style SPA routing through `Frontend/vercel.json`.

## Project Structure

```text
finance-management-system/
|-- README.md
|-- .gitignore
|-- Backend/
|   |-- .env.example
|   |-- package.json
|   |-- package-lock.json
|   |-- ai_sql_service/
|   |   |-- requirements.txt
|   |   `-- app/
|   |       |-- __init__.py
|   |       |-- main.py
|   |       |-- agent_service.py
|   |       |-- schema_context.py
|   |       `-- sql_guard.py
|   `-- src/
|       |-- app.js
|       |-- server.js
|       |-- config/
|       |   |-- env.js
|       |   `-- mail.js
|       |-- data/
|       |   `-- financialBook.json
|       |-- db/
|       |   |-- connection.js
|       |   |-- init.js
|       |   `-- schema.sql
|       |-- middlewares/
|       |   |-- auth.middleware.js
|       |   `-- error.middleware.js
|       |-- modules/
|       |   |-- ai/
|       |   |-- auth/
|       |   |-- budgets/
|       |   |-- categories/
|       |   |-- dashboard/
|       |   |-- profile/
|       |   |-- reports/
|       |   `-- transactions/
|       `-- utils/
|           |-- otp.js
|           |-- receipt.js
|           |-- response.js
|           `-- token.js
`-- Frontend/
    |-- .env.example
    |-- index.html
    |-- package.json
    |-- package-lock.json
    |-- eslint.config.js
    |-- postcss.config.js
    |-- tailwind.config.js
    |-- vite.config.js
    |-- vercel.json
    |-- public/
    |   |-- favicon.svg
    |   `-- icons.svg
    `-- src/
        |-- App.jsx
        |-- main.jsx
        |-- index.css
        |-- components/
        |   |-- auth/
        |   |-- budgets/
        |   |-- cashflow/
        |   |-- common/
        |   |-- dashboard/
        |   |-- reports/
        |   `-- transactions/
        |-- hooks/
        |-- lib/
        `-- pages/
```

## System Architecture

The application follows a standard full-stack architecture:

```text
User browser
  -> React frontend
  -> API client in Frontend/src/lib
  -> Express backend routes
  -> authentication middleware
  -> controller layer
  -> service layer
  -> repository layer
  -> PostgreSQL database
```

External integrations are used where configured:

- SMTP or Brevo API sends OTP and password reset emails.
- Google OAuth supports Google registration and login.
- Gemini or OpenAI powers AI Insights, receipt scanning, and quick-entry parsing.
- The optional FastAPI AI SQL service can answer finance questions by safely querying PostgreSQL through a separate microservice.

## Environment Variables

Environment examples are provided in `Backend/.env.example` and `Frontend/.env.example`. Real `.env` files should not be committed.

### Backend Variables

Required:

| Variable                          | Description                                                                      |
| --------------------------------- | -------------------------------------------------------------------------------- |
| `JWT_ACCESS_SECRET`               | Secret for signing access tokens.                                                |
| `JWT_REFRESH_SECRET`              | Secret for signing refresh tokens.                                               |
| `JWT_ACCESS_EXPIRES`              | Access token lifetime, for example `15m`.                                        |
| `JWT_REFRESH_EXPIRES`             | Refresh token lifetime, for example `7d`.                                        |
| `DATABASE_URL`                    | PostgreSQL connection string. Required unless using individual DB fields.        |
| `MAIL_FROM`                       | Sender name/email used for OTP messages.                                         |
| `BREVO_API_KEY` or SMTP variables | Email delivery configuration. If Brevo is not used, SMTP variables are required. |

Database alternative when `DATABASE_URL` is not used:

| Variable      | Description               |
| ------------- | ------------------------- |
| `DB_HOST`     | PostgreSQL host.          |
| `DB_PORT`     | PostgreSQL port.          |
| `DB_USER`     | PostgreSQL username.      |
| `DB_PASSWORD` | PostgreSQL password.      |
| `DB_NAME`     | PostgreSQL database name. |

SMTP variables required when `BREVO_API_KEY` is empty:

| Variable    | Description                    |
| ----------- | ------------------------------ |
| `MAIL_HOST` | SMTP host.                     |
| `MAIL_PORT` | SMTP port.                     |
| `MAIL_USER` | SMTP username.                 |
| `MAIL_PASS` | SMTP password or app password. |
| `MAIL_FROM` | Sender name/email.             |

Optional:

| Variable                       | Description                                                             |
| ------------------------------ | ----------------------------------------------------------------------- |
| `PORT`                         | Backend server port. Defaults to `5000`.                                |
| `APP_BASE_URL`                 | Backend public base URL, used for receipt URLs.                         |
| `BREVO_API_KEY`                | Uses Brevo API instead of SMTP when set.                                |
| `OTP_EXPIRES_MINUTES`          | OTP expiry duration. Defaults to `5`.                                   |
| `OTP_RESEND_COOLDOWN_SECONDS`  | OTP resend cooldown. Defaults to `60`.                                  |
| `GOOGLE_CLIENT_ID`             | Required for Google Sign-In.                                            |
| `GOOGLE_CLIENT_SECRET`         | Required for Google Sign-In.                                            |
| `AI_PROVIDER`                  | `gemini`, `openai`, or `app`. Defaults to `gemini`.                     |
| `AI_FALLBACK_ENABLED`          | Allows app fallback when provider keys are missing. Defaults to `true`. |
| `GEMINI_API_KEY`               | Required for live Gemini output.                                        |
| `GEMINI_MODEL`                 | Gemini model name. Defaults to `gemini-2.5-flash`.                      |
| `GEMINI_BASE_URL`              | Gemini API base URL.                                                    |
| `OPENAI_API_KEY`               | Required for live OpenAI output.                                        |
| `OPENAI_MODEL`                 | OpenAI model name. Defaults to `gpt-4o-mini`.                           |
| `OPENAI_BASE_URL`              | OpenAI API base URL.                                                    |
| `AI_SQL_AGENT_ENABLED`         | Enables the optional AI SQL service integration. Defaults to `false`.   |
| `AI_SQL_SERVICE_URL`           | FastAPI AI SQL service URL.                                             |
| `AI_SQL_SERVICE_SHARED_SECRET` | Shared secret between backend and AI SQL service. Required if enabled.  |
| `AI_SQL_SERVICE_TIMEOUT_MS`    | Timeout for AI SQL service calls.                                       |
| `AI_SQL_DATABASE_URL`          | Read-only database URL for the AI SQL service.                          |
| `AI_SQL_MAX_ROWS`              | Maximum rows returned by AI SQL service queries.                        |
| `AI_SQL_LLM_PROVIDER`          | AI SQL service provider, `openai` or `gemini`.                          |

### Frontend Variables

Required:

| Variable            | Description                                               |
| ------------------- | --------------------------------------------------------- |
| `VITE_API_BASE_URL` | Backend API URL, for example `http://localhost:5000/api`. |

Optional:

| Variable                | Description                                   |
| ----------------------- | --------------------------------------------- |
| `VITE_GOOGLE_CLIENT_ID` | Required only when Google Sign-In is enabled. |

## Installation and Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd finance-management-system
```

### 2. Install dependencies

```bash
cd Backend
npm install
```

### 3. Set up environment variables

Create local environment files from the examples:

```bash
cp Backend/.env.example Backend/.env
```

Fill in your own values. Do not commit real `.env` files.

Set the required database, email, and JWT variables. Optional integrations such as Google OAuth, Gemini, OpenAI, Brevo, and the AI SQL service can be added later.

### 4. Set Up Database

Create an empty PostgreSQL database locally or on a managed provider. Then set either:

```text
DATABASE_URL=postgresql://username:password@host/database
```

or the individual `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` variables.

### 5. Run Database Initialization

There is no separate migration command. The backend automatically runs `Backend/src/db/schema.sql` and seeds default categories during server startup.

### 6. Start Backend Server

```bash
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

### 7. Install Frontend Dependencies

Open a second terminal:

```bash
cd Frontend
npm install
```

### 8. Configure Frontend Environment

Create `Frontend/.env` from the example file:

```bash
cp .env.example .env
```

Set:

```text
VITE_API_BASE_URL=http://localhost:5000/api
```

If Google Sign-In is enabled, also set:

```text
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
```

### 9. Start Frontend Development Server

```bash
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

## Running the Project

Run the backend and frontend in separate terminals:

```bash
cd Backend
npm run dev
```

```bash
cd Frontend
npm run dev
```

Production-style commands:

```bash
cd Backend
npm start
```

```bash
cd Frontend
npm run build
npm run preview
```

Frontend linting:

```bash
cd Frontend
npm run lint
```

## API Overview

All protected routes require an `Authorization: Bearer <access_token>` header.

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/verify-otp`
- `POST /api/auth/resend-verification-otp`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/google`
- `POST /api/auth/forgot-password`
- `POST /api/auth/verify-reset-otp`
- `POST /api/auth/reset-password`

### Profile

- `GET /api/profile`
- `PUT /api/profile`
- `PUT /api/profile/password`

### Transactions

- `GET /api/transactions`
- `POST /api/transactions`
- `GET /api/transactions/:id`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`
- `POST /api/transactions/parse-receipt`
- `POST /api/transactions/parse-entry`

### Categories

- `GET /api/categories`

### Budgets

- `GET /api/budgets`
- `POST /api/budgets`
- `PUT /api/budgets/:id`
- `DELETE /api/budgets/:id`

### Dashboard

- `GET /api/dashboard/summary`
- `GET /api/dashboard/recent-transactions`
- `GET /api/dashboard/budget-snapshot`
- `GET /api/dashboard/spending-analytics`

### Reports

- `GET /api/reports/summary`
- `GET /api/reports/spending-by-category`
- `GET /api/reports/monthly-comparison`
- `GET /api/reports/top-spending`
- `GET /api/reports/export.csv`

### AI

- `POST /api/ai/chat`
- `POST /api/ai/ask`

`/api/ai/chat` uses the main AI Insights service with Gemini, OpenAI, or fallback behavior. `/api/ai/ask` calls the optional AI SQL service and requires `AI_SQL_AGENT_ENABLED=true`.

## Demo Account and Deployment

No public deployment link or fixed demo account is stored in the repository.

- Deployment link: [Add link]
- Demo email: [Add email]
- Demo password: [Add password]

The existing deployment guide is available in `DEPLOY.md`.

## Limitations

- The backend requires valid environment variables before it can connect to PostgreSQL or start successfully.
- OTP verification and password reset flows require a working Brevo API key or SMTP configuration.
- Google Sign-In only works when both frontend and backend Google OAuth variables are configured correctly.
- Live AI output requires valid Gemini or OpenAI credentials.
- AI fallback behavior is available for AI Insights, but receipt scanning and quick-entry AI parsing require a configured AI provider.
- Receipt files are stored on the backend local filesystem under `uploads/receipts`; production deployments should use persistent object storage.
- The optional AI SQL service is separate from the main Express server and must be configured and run independently.
- No dedicated automated test suite is present in the current repository; manual smoke testing and frontend linting are recommended.

## Future Improvements

- Add automated backend and frontend tests for authentication, transactions, budgets, reports, and AI flows.
- Add CI checks for linting, builds, and API smoke tests.
- Add deployment monitoring and structured logging.
- Move receipt uploads from local storage to cloud object storage.
- Add multi-currency support.
- Improve AI categorization and transaction recommendations.
- Add database migration tooling for versioned schema changes.
- Add role-based administration if the system expands beyond personal use.

## Contributors

Contributor information found in the Git history:

| Contributor | Git identity                  |
| ----------- | ----------------------------- |
| thv1611     | `truonghavy124@gmail.com`     |
| quangcammm  | `quangnguyen762017@gmail.com` |
| Mihanyo     | `hoanpro453@gmail.com`        |
