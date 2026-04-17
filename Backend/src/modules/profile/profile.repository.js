const pool = require("../../db/connection");

async function findProfileByUserId(userId) {
  const { rows } = await pool.query(
    `SELECT
      id,
      full_name,
      email,
      auth_provider,
      avatar_url,
      is_verified,
      created_at,
      updated_at
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

async function findProfileCredentialsByUserId(userId) {
  const { rows } = await pool.query(
    `SELECT id, auth_provider, password_hash
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

async function updateProfileByUserId(userId, { fullName, avatarUrl }) {
  const { rows } = await pool.query(
    `UPDATE users
     SET full_name = $1,
         avatar_url = $2,
         updated_at = NOW()
     WHERE id = $3
     RETURNING
       id,
       full_name,
       email,
       auth_provider,
       avatar_url,
       is_verified,
       created_at,
       updated_at`,
    [fullName, avatarUrl || null, userId]
  );

  return rows[0] || null;
}

async function updatePasswordByUserId(userId, passwordHash) {
  await pool.query(
    `UPDATE users
     SET password_hash = $1,
         updated_at = NOW()
     WHERE id = $2`,
    [passwordHash, userId]
  );
}

module.exports = {
  findProfileByUserId,
  findProfileCredentialsByUserId,
  updateProfileByUserId,
  updatePasswordByUserId,
};
