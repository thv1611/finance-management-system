# Finance Management System

## 1. Project Information

**Project name:** Finance Management System

**Short description:**  
This is a full-stack personal finance management website. Users can register an account, verify email by OTP, add income and expense transactions, create monthly budgets, view dashboard/report analytics, export report data to CSV, and use an AI Insights chat to receive finance suggestions based on their own data.

**Group members:**  
Please replace the placeholders below before final submission.

| Name | Student ID | Main responsibility |
| --- | --- | --- |
| `<Member 1>` | `<Student ID>` | `<Role>` |
| `<Member 2>` | `<Student ID>` | `<Role>` |
| `<Member 3>` | `<Student ID>` | `<Role>` |

## 2. Main Features To Review

- Account registration and email OTP verification.
- Login, logout, refresh token, forgot password, and reset password.
- Google Sign-In support if Google OAuth is configured.
- Add, edit, delete, search, and filter income/expense transactions.
- Create monthly category budgets and view progress/overspending warnings.
- Dashboard showing balance, income, expenses, savings, recent transactions, and budget status.
- Reports showing income vs expense, spending by category, monthly comparison, saving ratio, and top spending categories.
- Export report data to CSV.
- AI Insights chat using transaction, budget, dashboard, and report data as context.
- Fallback AI mode if no Gemini/OpenAI key is configured.

## 3. Tech Stack

- Frontend: React, Vite, React Router, Tailwind CSS
- Backend: Node.js, Express
- Database: PostgreSQL
- Authentication: JWT access token and refresh token
- Email service: Nodemailer SMTP
- Optional integrations: Google OAuth, Gemini/OpenAI

## 4. Project Structure

```text
source_code/
|-- README.md
|-- DEMO_SCRIPT.md
|-- DEPLOY.md
|-- REPORT.md
|-- Backend/
|   |-- .env.example
|   |-- package.json
|   `-- src/
|       |-- app.js
|       |-- server.js
|       |-- config/
|       |-- db/
|       |   |-- schema.sql
|       |   `-- init.js
|       `-- modules/
|           |-- auth/
|           |-- transactions/
|           |-- budgets/
|           |-- reports/
|           |-- dashboard/
|           |-- profile/
|           |-- categories/
|           `-- ai/
`-- Frontend/
    |-- .env.example
    |-- package.json
    `-- src/
        |-- App.jsx
        |-- pages/
        |-- components/
        |-- lib/
        `-- hooks/
```

## 5. Required Tools

To run the project from a clean machine, install:

- Node.js 20 or newer
- npm
- PostgreSQL database, either local or hosted
- SMTP email account for OTP and reset-password email
- Optional: Google OAuth client
- Optional: Gemini or OpenAI API key

## 6. Environment Setup

The source code includes example environment files:

```text
Backend/.env.example
Frontend/.env.example
```

Create real local environment files:

```bash
cp Backend/.env.example Backend/.env
cp Frontend/.env.example Frontend/.env
```

The `.env.example` files show all required variable names, but they do not contain real secrets. Real `.env` files must not be submitted.

### Backend `.env`

Required values:

```text
DATABASE_URL=postgresql://username:password@host/database
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@example.com
MAIL_PASS=your-smtp-app-password
MAIL_FROM=Finance Management <your-email@example.com>
JWT_ACCESS_SECRET=replace_with_a_long_random_access_secret
JWT_REFRESH_SECRET=replace_with_a_different_long_random_refresh_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
```

Optional values:

```text
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
AI_PROVIDER=gemini
AI_FALLBACK_ENABLED=true
GEMINI_API_KEY=
OPENAI_API_KEY=
```

If `AI_FALLBACK_ENABLED=true`, the AI page can still work without a real Gemini/OpenAI key.

### Frontend `.env`

Required values:

```text
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

For deployment, `VITE_API_BASE_URL` must point to the deployed backend API.

## 7. Installation

Install backend dependencies:

```bash
cd Backend
npm install
```

Install frontend dependencies:

```bash
cd Frontend
npm install
```

## 8. Database Setup

The project uses PostgreSQL.

The database schema is in:

```text
Backend/src/db/schema.sql
```

The backend initialization logic is in:

```text
Backend/src/db/init.js
```

When the backend starts, it automatically:

1. Connects to the database using `DATABASE_URL`.
2. Creates the required tables if they do not exist.
3. Seeds default categories such as Food, Transport, Shopping, Bills, Entertainment, Salary, Bonus, and Freelance.

There is no separate migration command in the current version. To run on a clean database, create an empty PostgreSQL database, set `DATABASE_URL`, and start the backend.

## 9. How To Run Backend

```bash
cd Backend
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/
```

Expected response:

```text
Backend is running
```

## 10. How To Run Frontend

```bash
cd Frontend
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## 11. How To Run The Full System From A Clean Machine

1. Install Node.js, npm, and prepare a PostgreSQL database.
2. Extract the submitted zip file.
3. Copy environment examples:

```bash
cp Backend/.env.example Backend/.env
cp Frontend/.env.example Frontend/.env
```

4. Fill in real values in `Backend/.env`, especially:

```text
DATABASE_URL
MAIL_HOST
MAIL_PORT
MAIL_USER
MAIL_PASS
MAIL_FROM
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
```

5. Fill in `Frontend/.env`:

```text
VITE_API_BASE_URL=http://localhost:5000/api
```

6. Install dependencies:

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

7. Start backend in one terminal:

```bash
cd Backend
npm run dev
```

8. Start frontend in another terminal:

```bash
cd Frontend
npm run dev
```

9. Open the website:

```text
http://localhost:5173
```

10. Register an account and verify the OTP email.

## 12. Demo Account

No fixed local demo account is included because account verification uses email OTP and depends on the configured database.

Recommended demo process:

1. Run the system.
2. Register a new account with a real email.
3. Verify OTP.
4. Add sample income, expenses, and budgets.
5. Use that account during the demo.

If a public deployment and demo account are prepared, add them here:

```text
Demo URL: <deployment URL>
Email: <demo email>
Password: <demo password>
```

## 13. Useful Demo Flow For Grading

1. Register and verify email.
2. Log in.
3. Add one income transaction and several expense transactions.
4. Create a monthly budget.
5. Open dashboard and explain the summary cards.
6. Open reports and export CSV.
7. Open AI Insights and ask: `Which category should I fix first?`

## 14. Build And Validation Commands

Frontend build:

```bash
cd Frontend
npm run build
```

Frontend lint:

```bash
cd Frontend
npm run lint
```

Backend start:

```bash
cd Backend
npm start
```

## 15. Known Issues

- Real `.env` values are required before the backend can connect to the database or send OTP email.
- If SMTP credentials are invalid, registration OTP and reset-password email will not work.
- Google Sign-In only works after Google OAuth credentials and allowed origins are configured.
- If no Gemini/OpenAI key is configured, AI Insights uses fallback app-side guidance.
- Receipt uploads use local backend storage. For production, cloud object storage would be better.
- Backend automated test coverage is limited, so manual smoke testing is recommended before submission.

## 16. Final Zip Submission Notes

The submitted zip file must include the complete source code. A GitHub/repository link alone is not enough.

Include:

```text
README.md
DEMO_SCRIPT.md
DEPLOY.md
REPORT.md
Backend/
Frontend/
.gitignore
Backend/.env.example
Frontend/.env.example
```

Do not include:

```text
node_modules/
.venv/
.env
dist/
build/
coverage/
.cache/
logs/
*.log
*.tmp
large generated files
local cache files
```

The `.env.example` files are included so the project can be reproduced without exposing private credentials.
