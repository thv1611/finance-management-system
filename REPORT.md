# Final Project Report - Finance Management System

## 1. Cover Page

- Course: SS2
- Project name: Finance Management System
- Group number: `<GroupNumber>`
- Members: `<Member names, student IDs, and roles>`
- Repository link: `<Repository link>`
- Demo/deployment link: `<Deployment link if available>`
- Project tracking file: `<Tracking file link if available>`

## 2. Project Summary

The Finance Management System is a full-stack web application for personal finance tracking. It helps users record income and expenses, organize transactions by category, set monthly budgets, view financial reports, export data, and ask an AI assistant for finance suggestions based on their real app data.

The project targets students and individual users who want a simple dashboard for understanding their spending habits and savings progress. The main completed features are authentication, transaction management, budget tracking, dashboard summaries, reports, CSV export, and AI-powered insights.

The high-level architecture is a React single-page frontend connected to an Express backend API. The backend stores persistent data in PostgreSQL and integrates with SMTP email, Google OAuth, and optional AI providers such as Gemini or OpenAI.

## 3. Progress to Final Outcome

At the beginning of the project, the main goal was to build a basic finance tracker with user accounts and transaction records. During development, the scope became more complete as we added budgets, reports, authentication recovery flows, CSV export, and AI insights.

The project developed in these main phases:

- Authentication foundation: email registration, OTP verification, login, JWT access/refresh tokens, logout, forgot-password, and reset-password.
- Core finance data: transaction CRUD, categories, PostgreSQL schema, and user-specific data isolation.
- Budget and report features: monthly category budgets, dashboard summaries, income/expense reports, category reports, monthly comparison, and CSV export.
- AI integration: AI Insights chat using the user's transactions, budgets, dashboard summary, and reports as context.
- Packaging and deployment readiness: environment examples, README, deploy guide, demo script, and verification checks.

The final outcome is a deployable full-stack application rather than a static prototype. The app can be run locally with PostgreSQL and can also be deployed with separate frontend and backend hosting.

## 4. What We Learned

The first major lesson was how frontend, backend, and database layers work together in a real web system. The frontend cannot simply display static data; it must manage authentication state, call protected APIs, handle loading/error states, and keep the user interface consistent with backend responses.

The second lesson was the importance of API design. Routes such as `/api/auth`, `/api/transactions`, `/api/budgets`, `/api/reports`, `/api/dashboard`, and `/api/ai` were separated by module so each part of the system has a clear responsibility. This made debugging easier because authentication, finance data, reporting, and AI behavior could be checked independently.

The third lesson was that database design affects the whole application. The project uses relational tables such as users, categories, transactions, budgets, email verifications, refresh tokens, and password resets. Foreign keys and constraints protect data integrity, while query logic in repositories and services turns raw data into useful dashboard and report results.

The fourth lesson was how to integrate AI in a meaningful way. A generic chatbot would not be enough for this project. The AI feature needed to use real finance context from the application so that responses could mention the user's spending, budget status, savings, and recent transaction patterns.

## 5. Technical Challenges and Solutions

### Challenge 1: Multiple authentication flows

The authentication module includes normal registration, OTP verification, login, refresh tokens, logout, forgot-password, reset-password, and Google Sign-In. Keeping these flows in one file would have been difficult to maintain.

Solution: the backend separates routes, controllers, validation, services, and repository logic. This keeps request validation, business logic, and SQL access separated. The frontend also separates auth API calls, session persistence, protected routes, and Google auth handling.

### Challenge 2: Secure user-specific finance data

Transactions, budgets, dashboard data, and reports must always belong to the authenticated user. A missing user filter could expose or mix financial data.

Solution: protected routes use the `requireAuth` middleware, and service/repository functions receive the authenticated `userId`. Queries are written around that user ID so each user only sees their own data.

### Challenge 3: Useful reports from relational data

Reports require aggregating transactions by date range, category, type, and month. Simple CRUD endpoints were not enough.

Solution: the reports module implements dedicated endpoints for summary, spending by category, monthly comparison, top spending, and CSV export. This keeps reporting logic on the backend where SQL aggregation is more appropriate.

### Challenge 4: AI provider availability

External AI providers may fail because of missing keys, invalid keys, quota limits, or network issues. If the entire AI feature depended only on an external model, the demo would be fragile.

Solution: the backend supports Gemini/OpenAI when configured, but also includes app-side fallback insights. The AI page can still answer common finance questions using computed app data even when no provider key is available.

### Challenge 5: Deployment configuration

The app has separate frontend and backend environments. A wrong API URL, missing database URL, or missing SMTP value can break the deployed version.

Solution: `.env.example` files document required variables, and `DEPLOY.md` explains how to set backend and frontend variables. The backend now fails clearly if required backend variables or database connection are invalid.

## 6. Planned Work vs Final Result

| Planned area | Final result |
| --- | --- |
| Basic login/register | Completed with OTP verification, JWT tokens, logout, forgot-password, reset-password, and Google Sign-In |
| Transaction tracker | Completed with create, read, update, delete, filtering, categories, quick entry, and receipt-ready model |
| Budget tracking | Completed with monthly category limits and budget progress |
| Dashboard | Completed with summary cards, recent transactions, budget snapshot, and finance highlights |
| Reports | Completed with summary, category breakdown, monthly comparison, top spending, saving ratio, and CSV export |
| AI integration | Completed with AI Insights chat using real app data and fallback mode |
| Deployment readiness | Prepared with README, env examples, deploy guide, and validation checklist |

## 7. Member Contributions

Use the project tracking file as the main evidence for member contributions. The recommended evidence columns are phase, task, assigned member, status, challenge, solution/result, and proof.

Suggested contribution mapping:

| Area | Evidence to include |
| --- | --- |
| Frontend UI and pages | Screenshots, component commits, page implementation tasks |
| Backend API modules | Route/controller/service/repository commits |
| Database schema | `Backend/src/db/schema.sql`, migration/init commits |
| Authentication | Auth flow commits, OTP/reset/Google test evidence |
| Reports and CSV export | Report endpoint commits and exported CSV screenshot |
| AI integration | AI module commits and AI Insights demo screenshot |
| Deployment/package | README, env examples, deploy guide, build verification |

Before final submission, replace this section with the actual member names, student IDs, roles, and tracking-file proof.

## 8. Limitations and Future Improvements

- Receipt uploads currently use local backend storage. For production, object storage such as S3, Cloudinary, or Firebase Storage would be more reliable.
- The AI SQL agent is optional and disabled by default. A future version could deploy this as a separate secured service.
- Automated backend tests are limited. More API integration tests should be added for auth, transactions, budgets, reports, and AI fallback.
- The deployment guide supports common hosts, but a single official deployment target should be selected and documented with the final public URL.
- More advanced finance features could include recurring transactions, shared budgets, notifications, and richer chart visualizations.

## 9. Appendix

Important source files:

- `Backend/src/db/schema.sql`: database schema.
- `Backend/src/app.js`: Express route registration.
- `Backend/src/server.js`: database initialization and server startup.
- `Backend/src/modules/auth`: authentication logic.
- `Backend/src/modules/transactions`: transaction CRUD.
- `Backend/src/modules/budgets`: budget management.
- `Backend/src/modules/reports`: reports and CSV export.
- `Backend/src/modules/ai`: AI Insights and fallback logic.
- `Frontend/src/App.jsx`: frontend routing.
- `Frontend/src/pages`: main application pages.
- `Frontend/src/lib`: API clients and session helpers.

Verification before packaging:

- Frontend build: pass.
- Frontend lint: pass.
- Backend module load: pass.
- PostgreSQL schema initialization and query smoke test: pass.
