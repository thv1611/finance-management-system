const fs = require("fs/promises");
const path = require("path");

function splitSqlStatements(sqlContent) {
  return sqlContent
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function runSchemaMigrations(pool) {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schemaContent = await fs.readFile(schemaPath, "utf8");
  const statements = splitSqlStatements(schemaContent);

  for (const statement of statements) {
    await pool.query(statement);
  }
}

async function initializeDatabase(pool) {
  await runSchemaMigrations(pool);
}

module.exports = {
  initializeDatabase,
};
