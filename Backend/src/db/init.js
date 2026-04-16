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

async function seedDefaultCategories(pool) {
  const defaultCategories = [
    ["Food", "expense"],
    ["Transport", "expense"],
    ["Shopping", "expense"],
    ["Bills", "expense"],
    ["Entertainment", "expense"],
    ["Salary", "income"],
    ["Bonus", "income"],
    ["Freelance", "income"],
  ];

  for (const [name, type] of defaultCategories) {
    await pool.query(
      `INSERT INTO categories (user_id, name, type, is_default)
       SELECT NULL::INTEGER, $1::VARCHAR(100), $2::VARCHAR(20), TRUE
       WHERE NOT EXISTS (
         SELECT 1
         FROM categories
         WHERE user_id IS NULL
           AND is_default = TRUE
           AND LOWER(name) = LOWER($1::VARCHAR(100))
           AND type = $2::VARCHAR(20)
       )`,
      [name, type]
    );
  }
}

async function initializeDatabase(pool) {
  await runSchemaMigrations(pool);
  await seedDefaultCategories(pool);
}

module.exports = {
  initializeDatabase,
};
