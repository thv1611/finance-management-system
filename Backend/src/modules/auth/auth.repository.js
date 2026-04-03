const pool = require("../../db/connection");

async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  return rows[0] || null;
}

async function createUser(fullName, email, passwordHash) {
  const [result] = await pool.execute(
    `INSERT INTO users (full_name, email, password_hash, is_verified)
     VALUES (?, ?, ?, false)`,
    [fullName, email, passwordHash]
  );

  return result.insertId;
}

async function createEmailVerification(userId, otpCode, expiresAt) {
  const [result] = await pool.execute(
    `INSERT INTO email_verifications (user_id, otp_code, expires_at, is_used)
     VALUES (?, ?, ?, false)`,
    [userId, otpCode, expiresAt]
  );

  return result.insertId;
}

async function findLatestUnusedOtpByUserId(userId) {
  const [rows] = await pool.execute(
    `SELECT * FROM email_verifications
     WHERE user_id = ? AND is_used = false
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

async function markOtpAsUsed(id) {
  await pool.execute(
    `UPDATE email_verifications
     SET is_used = true, used_at = NOW()
     WHERE id = ?`,
    [id]
  );
}

async function markUserAsVerified(userId) {
  await pool.execute(
    `UPDATE users
     SET is_verified = true
     WHERE id = ?`,
    [userId]
  );
}

async function createRefreshToken(userId, token, expiresAt) {
  const [result] = await pool.execute(
    `INSERT INTO refresh_tokens (user_id, token, expires_at, is_revoked)
     VALUES (?, ?, ?, false)`,
    [userId, token, expiresAt]
  );

  return result.insertId;
}

module.exports = {
  findUserByEmail,
  createUser,
  createEmailVerification,
  findLatestUnusedOtpByUserId,
  markOtpAsUsed,
  markUserAsVerified,
  createRefreshToken,
};