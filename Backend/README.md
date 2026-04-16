# Backend Setup

## 1. Configure environment variables

Create `Backend/.env` and set either a PostgreSQL `DATABASE_URL` or the individual DB fields.

For Neon, prefer:

- `DATABASE_URL`

You still need the non-database variables:

- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USER`
- `MAIL_PASS`
- `MAIL_FROM`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES`
- `JWT_REFRESH_EXPIRES`

## 2. Install dependencies

```bash
npm install
```

## 3. Run the backend

```bash
npm run dev
```

When the server starts, it will:

- connect to PostgreSQL
- create the required tables from `src/db/schema.sql`

If startup fails, check your `.env` values and database permissions first.
