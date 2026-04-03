const bcrypt = require("bcryptjs");
const authRepository = require("./auth.repository");
const { generateOtp, getOtpExpiryDate } = require("../../utils/otp");
const { sendOtpEmail } = require("../../config/mail");
const env = require("../../config/env");
const {
  generateAccessToken,
  generateRefreshToken,
  decodeJwtExpiry,
} = require("../../utils/token");

async function register(payload) {
  const { full_name, email, password } = payload;

  const existingUser = await authRepository.findUserByEmail(email);
  if (existingUser) {
    const error = new Error("Email already exists");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const userId = await authRepository.createUser(
    full_name,
    email,
    passwordHash
  );

  const otpCode = generateOtp();
  const expiresAt = getOtpExpiryDate(env.otp.expiresMinutes);

  await authRepository.createEmailVerification(userId, otpCode, expiresAt);
  await sendOtpEmail(email, otpCode);

  return {
    user_id: userId,
    email,
    message: "Registration successful. Please verify your email with OTP.",
  };
}

async function verifyOtp(payload) {
  const { email, otp_code } = payload;

  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const latestOtp = await authRepository.findLatestUnusedOtpByUserId(user.id);
  if (!latestOtp) {
    const error = new Error("No valid OTP found");
    error.statusCode = 404;
    throw error;
  }

  const now = new Date();

  if (new Date(latestOtp.expires_at) < now) {
    const error = new Error("OTP has expired");
    error.statusCode = 400;
    throw error;
  }

  if (latestOtp.otp_code !== otp_code) {
    const error = new Error("Invalid OTP code");
    error.statusCode = 400;
    throw error;
  }

  await authRepository.markOtpAsUsed(latestOtp.id);
  await authRepository.markUserAsVerified(user.id);

  return {
    email,
    message: "Email verified successfully",
  };
}

async function login(payload) {
  const { email, password } = payload;

  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordCorrect) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.is_verified) {
    const error = new Error("Please verify your email before logging in");
    error.statusCode = 403;
    throw error;
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const refreshExpiresAt = decodeJwtExpiry(refreshToken);

  await authRepository.createRefreshToken(
    user.id,
    refreshToken,
    refreshExpiresAt
  );

  return {
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      is_verified: user.is_verified,
    },
    access_token: accessToken,
    refresh_token: refreshToken,
  };
}

module.exports = {
  register,
  verifyOtp,
  login,
};