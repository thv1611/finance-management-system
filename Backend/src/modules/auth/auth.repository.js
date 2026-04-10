const pool = require("../../db/connection");

async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  return rows[0] || null;
}

async function findUserByGoogleId(googleId) {
  const [rows] = await pool.execute(
    "SELECT * FROM users WHERE google_id = ? LIMIT 1",
    [googleId]
  );
  return rows[0] || null;
}

async function createUser(fullName, email, passwordHash) {
  const [result] = await pool.execute(
    `INSERT INTO users (full_name, email, password_hash, auth_provider, is_verified)
     VALUES (?, ?, ?, 'local', false)`,
    [fullName, email, passwordHash]
  );

  return result.insertId;
}

async function createGoogleUser(fullName, email, passwordHash, googleId, avatarUrl) {
  const [result] = await pool.execute(
    `INSERT INTO users (
      full_name,
      email,
      password_hash,
      auth_provider,
      google_id,
      avatar_url,
      is_verified
    )
     VALUES (?, ?, ?, 'google', ?, ?, true)`,
    [fullName, email, passwordHash, googleId, avatarUrl]
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

async function createPasswordReset(userId, otpCode, otpExpiresAt) {
  const [result] = await pool.execute(
    `INSERT INTO password_resets (user_id, otp_code, otp_expires_at)
     VALUES (?, ?, ?)`,
    [userId, otpCode, otpExpiresAt]
  );

  return result.insertId;
}

async function findLatestPasswordResetByUserId(userId) {
  const [rows] = await pool.execute(
    `SELECT * FROM password_resets
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

async function completePasswordResetOtp(resetId, resetToken, resetTokenExpiresAt) {
  await pool.execute(
    `UPDATE password_resets
     SET otp_verified_at = NOW(),
         reset_token = ?,
         reset_token_expires_at = ?
     WHERE id = ?`,
    [resetToken, resetTokenExpiresAt, resetId]
  );
}

async function updateUserPassword(userId, passwordHash) {
  await pool.execute(
    `UPDATE users
     SET password_hash = ?
     WHERE id = ?`,
    [passwordHash, userId]
  );
}

async function markPasswordResetCompleted(resetId) {
  await pool.execute(
    `UPDATE password_resets
     SET is_completed = true,
         completed_at = NOW()
     WHERE id = ?`,
    [resetId]
  );
}

module.exports = {
  findUserByEmail,
  findUserByGoogleId,
  createUser,
  createGoogleUser,
  createEmailVerification,
  findLatestUnusedOtpByUserId,
  markOtpAsUsed,
  markUserAsVerified,
  createRefreshToken,
  createPasswordReset,
  findLatestPasswordResetByUserId,
  completePasswordResetOtp,
  updateUserPassword,
  markPasswordResetCompleted,
};
