# Backend Setup

## 1. Configure environment variables

Copy `Backend/.env.example` to `Backend/.env` and update the MySQL credentials:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

## 2. Start MySQL

Make sure your MySQL server is running and the user in `.env` has permission to create databases and tables.

## 3. Run the backend

```bash
npm install
npm run dev
```

When the server starts, it will:

- connect to MySQL
- create the database in `DB_NAME` if it does not exist
- create the required tables from `src/db/schema.sql`

If startup fails, check your `.env` values and MySQL permissions first.
