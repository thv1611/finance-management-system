# Final Presentation Demo Script

Use this script to demonstrate the working project clearly within a short presentation.

## 1. Opening

Introduce the project:

- Project name: Finance Management System.
- Goal: help users track income, expenses, budgets, reports, and personalized finance insights.
- Stack: React frontend, Express backend, PostgreSQL database, JWT authentication, and AI Insights.

## 2. Authentication Flow

1. Open the frontend URL.
2. Show the register page.
3. Create a new account with full name, email, and password.
4. Show the OTP verification page.
5. Enter the OTP from email.
6. Log in with the verified account.
7. Mention that Google Sign-In is also supported if OAuth is configured.

What to explain:

- The backend stores users securely with password hashes.
- OTP verification prevents unverified accounts from entering the app.
- JWT access and refresh tokens protect private finance endpoints.

## 3. Dashboard Flow

1. Navigate to the dashboard.
2. Show total balance, monthly income, monthly expenses, and monthly savings.
3. Show recent transactions.
4. Show budget snapshot or warning cards.

What to explain:

- Dashboard numbers come from PostgreSQL transactions and budget data.
- The frontend does not calculate everything alone; it calls backend summary endpoints.

## 4. Transactions Flow

1. Open the transactions page.
2. Create a new expense transaction.
3. Create a new income transaction.
4. Show search/filter behavior.
5. Edit one transaction.
6. Delete one transaction if appropriate.

What to explain:

- Transactions are user-specific.
- Categories help organize income and expenses.
- CRUD operations are handled by protected backend routes.

## 5. Budget Flow

1. Open the budgets page.
2. Create a monthly budget for one expense category.
3. Show spent amount, limit, progress, and warning state.

What to explain:

- Budgets connect category, month, year, and limit.
- The app compares transaction totals against the budget limit.

## 6. Reports Flow

1. Open the reports page.
2. Show income vs expense summary.
3. Show spending by category.
4. Show monthly comparison.
5. Show top spending categories.
6. Export CSV.

What to explain:

- Reports are generated through backend SQL aggregation.
- CSV export proves that data can be reused outside the app.

## 7. AI Insights Flow

1. Open AI Insights.
2. Ask: `Which budget category should I fix first?`
3. Ask: `How can I reduce my spending this month?`
4. Show whether the answer is from the configured AI model or fallback app insight.

What to explain:

- The AI feature is not a generic chatbot.
- It uses current dashboard, reports, budgets, and recent transactions as context.
- If Gemini/OpenAI is not configured, fallback mode still gives data-based finance guidance.

## 8. Technical Architecture Explanation

Summarize the architecture:

```text
React SPA -> Express API -> PostgreSQL
             |-- SMTP email
             |-- Google OAuth
             `-- Gemini/OpenAI or fallback insight logic
```

Mention key modules:

- `auth`: registration, OTP, login, refresh, password reset, Google auth.
- `transactions`: income and expense CRUD.
- `budgets`: monthly category budget limits.
- `reports`: summary, category breakdown, monthly comparison, CSV export.
- `ai`: AI Insights and fallback finance guidance.

## 9. Closing

End with:

- The project is a complete full-stack web application.
- The final version includes source code, environment examples, README, deployment guide, demo script, and final report draft.
- Future improvements include cloud file storage, more automated tests, recurring transactions, and richer analytics.
