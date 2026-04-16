const pool = require("../../db/connection");

async function findUserByEmail(email) {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE email = $1 LIMIT 1",
    [email]
  );
  return rows[0] || null;
}

async function findUserByGoogleId(googleId) {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE google_id = $1 LIMIT 1",
    [googleId]
  );
  return rows[0] || null;
}

async function createUser(fullName, email, passwordHash) {
  const { rows } = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, auth_provider, is_verified)
     VALUES ($1, $2, $3, 'local', false)
     RETURNING id`,
    [fullName, email, passwordHash]
  );

  return rows[0].id;
}

async function createGoogleUser(fullName, email, passwordHash, googleId, avatarUrl) {
  const { rows } = await pool.query(
    `INSERT INTO users (
      full_name,
      email,
      password_hash,
      auth_provider,
      google_id,
      avatar_url,
      is_verified
    )
     VALUES ($1, $2, $3, 'google', $4, $5, true)
     RETURNING id`,
    [fullName, email, passwordHash, googleId, avatarUrl]
  );

  return rows[0].id;
}

async function linkGoogleAccount(userId, googleId, avatarUrl) {
  await pool.query(
    `UPDATE users
     SET google_id = $1,
         avatar_url = COALESCE($2, avatar_url),
         is_verified = true,
         updated_at = NOW()
     WHERE id = $3`,
    [googleId, avatarUrl, userId]
  );
}

async function createEmailVerification(userId, otpCode, expiresAt) {
  const { rows } = await pool.query(
    `INSERT INTO email_verifications (user_id, otp_code, expires_at, is_used)
     VALUES ($1, $2, $3, false)
     RETURNING id`,
    [userId, otpCode, expiresAt]
  );

  return rows[0].id;
}

async function findLatestUnusedOtpByUserId(userId) {
  const { rows } = await pool.query(
    `SELECT * FROM email_verifications
     WHERE user_id = $1 AND is_used = false
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

async function markOtpAsUsed(id) {
  await pool.query(
    `UPDATE email_verifications
     SET is_used = true, used_at = NOW()
     WHERE id = $1`,
    [id]
  );
}

async function markUserAsVerified(userId) {
  await pool.query(
    `UPDATE users
     SET is_verified = true,
         updated_at = NOW()
     WHERE id = $1`,
    [userId]
  );
}

async function createRefreshToken(userId, token, expiresAt) {
  const { rows } = await pool.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at, is_revoked)
     VALUES ($1, $2, $3, false)
     RETURNING id`,
    [userId, token, expiresAt]
  );

  return rows[0].id;
}

async function createPasswordReset(userId, otpCode, otpExpiresAt) {
  const { rows } = await pool.query(
    `INSERT INTO password_resets (user_id, otp_code, otp_expires_at)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [userId, otpCode, otpExpiresAt]
  );

  return rows[0].id;
}

async function findLatestPasswordResetByUserId(userId) {
  const { rows } = await pool.query(
    `SELECT * FROM password_resets
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

async function completePasswordResetOtp(resetId, resetToken, resetTokenExpiresAt) {
  await pool.query(
    `UPDATE password_resets
     SET otp_verified_at = NOW(),
         reset_token = $1,
         reset_token_expires_at = $2
     WHERE id = $3`,
    [resetToken, resetTokenExpiresAt, resetId]
  );
}

async function updateUserPassword(userId, passwordHash) {
  await pool.query(
    `UPDATE users
     SET password_hash = $1,
         updated_at = NOW()
     WHERE id = $2`,
    [passwordHash, userId]
  );
}

async function markPasswordResetCompleted(resetId) {
  await pool.query(
    `UPDATE password_resets
     SET is_completed = true,
         completed_at = NOW()
     WHERE id = $1`,
    [resetId]
  );
}

module.exports = {
  findUserByEmail,
  findUserByGoogleId,
  createUser,
  createGoogleUser,
  linkGoogleAccount,
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
