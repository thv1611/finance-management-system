const fs = require("fs/promises");
const path = require("path");
const mysql = require("mysql2/promise");
const env = require("../config/env");

function splitSqlStatements(sqlContent) {
  return sqlContent
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean)
    .filter((statement) => !/^USE\s+/i.test(statement));
}

async function ensureDatabaseExists() {
  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${env.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await connection.end();
  }
}

async function runSchemaMigrations(pool) {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schemaContent = await fs.readFile(schemaPath, "utf8");
  const statements = splitSqlStatements(schemaContent);

  for (const statement of statements) {
    await pool.query(statement);
  }
}

async function columnExists(pool, tableName, columnName) {
  const [rows] = await pool.query(
    `SELECT 1
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ?
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?
     LIMIT 1`,
    [env.db.database, tableName, columnName]
  );

  return rows.length > 0;
}

async function indexExists(pool, tableName, indexName) {
  const [rows] = await pool.query(
    `SELECT 1
     FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = ?
       AND TABLE_NAME = ?
       AND INDEX_NAME = ?
     LIMIT 1`,
    [env.db.database, tableName, indexName]
  );

  return rows.length > 0;
}

async function ensureUsersGoogleColumns(pool) {
  if (!(await columnExists(pool, "users", "auth_provider"))) {
    await pool.query(
      "ALTER TABLE users ADD COLUMN auth_provider VARCHAR(20) NOT NULL DEFAULT 'local'"
    );
  }

  if (!(await columnExists(pool, "users", "google_id"))) {
    await pool.query("ALTER TABLE users ADD COLUMN google_id VARCHAR(255) NULL");
  }

  if (!(await columnExists(pool, "users", "avatar_url"))) {
    await pool.query("ALTER TABLE users ADD COLUMN avatar_url TEXT NULL");
  }

  if (!(await indexExists(pool, "users", "uq_users_google_id"))) {
    await pool.query(
      "ALTER TABLE users ADD UNIQUE INDEX uq_users_google_id (google_id)"
    );
  }
}

async function initializeDatabase(pool) {
  await ensureDatabaseExists();
  await runSchemaMigrations(pool);
  await ensureUsersGoogleColumns(pool);
}

module.exports = {
  initializeDatabase,
};
