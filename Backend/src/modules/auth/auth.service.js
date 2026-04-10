const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const authRepository = require("./auth.repository");
const { generateOtp, getOtpExpiryDate } = require("../../utils/otp");
const { sendOtpEmail, sendPasswordResetOtpEmail } = require("../../config/mail");
const env = require("../../config/env");
const {
  generateAccessToken,
  generateRefreshToken,
  decodeJwtExpiry,
} = require("../../utils/token");

function getGoogleClient() {
  if (!env.google.clientId || !env.google.clientSecret) {
    const error = new Error(
      "Google authentication is not configured on the backend. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to Backend/.env."
    );
    error.statusCode = 500;
    throw error;
  }

  return new OAuth2Client(
    env.google.clientId,
    env.google.clientSecret,
    "postmessage"
  );
}

async function issueAuthTokens(user) {
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
      auth_provider: user.auth_provider,
      avatar_url: user.avatar_url || null,
    },
    access_token: accessToken,
    refresh_token: refreshToken,
  };
}

function getGoogleProfileName(payload) {
  if (payload.name) {
    return payload.name;
  }

  if (payload.given_name || payload.family_name) {
    return [payload.given_name, payload.family_name].filter(Boolean).join(" ");
  }

  return payload.email.split("@")[0];
}

async function getGoogleProfileFromCode(code) {
  const googleClient = getGoogleClient();
  let tokens;

  try {
    const tokenResponse = await googleClient.getToken(code);
    tokens = tokenResponse.tokens;
  } catch (error) {
    const googleErrorData = error.response?.data;
    const googleErrorDescription =
      googleErrorData?.error_description ||
      googleErrorData?.error ||
      error.message;

    const authError = new Error(
      googleErrorDescription
        ? `Google token exchange failed: ${googleErrorDescription}`
        : "Google token exchange failed. Check your Google OAuth client configuration."
    );
    authError.statusCode = 400;
    authError.cause = error;
    throw authError;
  }

  if (!tokens.id_token) {
    const error = new Error("Google did not return a valid identity token.");
    error.statusCode = 400;
    throw error;
  }

  let ticket;

  try {
    ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.google.clientId,
    });
  } catch (error) {
    const authError = new Error(
      "Google identity token verification failed. Ensure the frontend and backend use the same Google client ID."
    );
    authError.statusCode = 400;
    throw authError;
  }

  const payload = ticket.getPayload();

  if (!payload?.email || !payload.sub) {
    const error = new Error("Unable to read the Google account profile.");
    error.statusCode = 400;
    throw error;
  }

  if (!payload.email_verified) {
    const error = new Error("Your Google email address must be verified.");
    error.statusCode = 403;
    throw error;
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    fullName: getGoogleProfileName(payload),
    avatarUrl: payload.picture || null,
  };
}

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

async function resendVerificationOtp(payload) {
  const { email } = payload;
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    return {
      email,
      message: "If an account matches that email, a verification code has been sent.",
    };
  }

  if (user.is_verified) {
    return {
      email,
      message: "This email address has already been verified.",
    };
  }

  const otpCode = generateOtp();
  const expiresAt = getOtpExpiryDate(env.otp.expiresMinutes);
  await authRepository.createEmailVerification(user.id, otpCode, expiresAt);
  await sendOtpEmail(email, otpCode);

  return {
    email,
    message: "If an account matches that email, a verification code has been sent.",
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

  if (user.auth_provider === "google") {
    const error = new Error("This account uses Google Sign-In. Continue with Google instead.");
    error.statusCode = 400;
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

  return issueAuthTokens(user);
}

async function forgotPassword(payload) {
  const { email } = payload;
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    return {
      email,
      message:
        "If an account matches that email, a reset code has been sent to your inbox.",
    };
  }

  const otpCode = generateOtp();
  const otpExpiresAt = getOtpExpiryDate(env.otp.expiresMinutes);

  await authRepository.createPasswordReset(user.id, otpCode, otpExpiresAt);
  await sendPasswordResetOtpEmail(email, otpCode);

  return {
    email,
    message:
      "If an account matches that email, a reset code has been sent to your inbox.",
  };
}

async function verifyPasswordResetOtp(payload) {
  const { email, otp_code } = payload;
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    const error = new Error("No valid password reset request was found.");
    error.statusCode = 404;
    throw error;
  }

  const latestReset = await authRepository.findLatestPasswordResetByUserId(user.id);
  if (!latestReset || latestReset.is_completed) {
    const error = new Error("No valid password reset request was found.");
    error.statusCode = 404;
    throw error;
  }

  if (new Date(latestReset.otp_expires_at) < new Date()) {
    const error = new Error("This verification code has expired. Request a new one.");
    error.statusCode = 400;
    throw error;
  }

  if (latestReset.otp_code !== otp_code) {
    const error = new Error("Invalid verification code.");
    error.statusCode = 400;
    throw error;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiresAt = getOtpExpiryDate(10);

  await authRepository.completePasswordResetOtp(
    latestReset.id,
    resetToken,
    resetTokenExpiresAt
  );

  return {
    email,
    reset_token: resetToken,
  };
}

async function resetPassword(payload) {
  const { email, reset_token, password } = payload;
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    const error = new Error("No valid password reset session was found.");
    error.statusCode = 404;
    throw error;
  }

  const latestReset = await authRepository.findLatestPasswordResetByUserId(user.id);
  if (
    !latestReset ||
    latestReset.is_completed ||
    !latestReset.reset_token ||
    latestReset.reset_token !== reset_token
  ) {
    const error = new Error("No valid password reset session was found.");
    error.statusCode = 400;
    throw error;
  }

  if (new Date(latestReset.reset_token_expires_at) < new Date()) {
    const error = new Error("Your reset session has expired. Start again.");
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await authRepository.updateUserPassword(user.id, passwordHash);
  await authRepository.markPasswordResetCompleted(latestReset.id);

  return {
    email,
    message: "Password reset successful. You can now sign in with your new password.",
  };
}

async function googleAuth(payload) {
  const { code, mode } = payload;
  const profile = await getGoogleProfileFromCode(code);

  const existingGoogleUser = await authRepository.findUserByGoogleId(profile.googleId);
  const existingEmailUser = await authRepository.findUserByEmail(profile.email);

  if (mode === "register") {
    if (existingGoogleUser) {
      const authData = await issueAuthTokens(existingGoogleUser);
      return {
        ...authData,
        message: "This Google account is already registered. Signed you in instead.",
        is_new_user: false,
      };
    }

    if (existingEmailUser) {
      const error = new Error(
        existingEmailUser.auth_provider === "google"
          ? "This Google account is already registered. Try signing in instead."
          : "An account with this email already exists. Sign in with your password instead."
      );
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(crypto.randomUUID(), 10);
    const userId = await authRepository.createGoogleUser(
      profile.fullName,
      profile.email,
      passwordHash,
      profile.googleId,
      profile.avatarUrl
    );
    const newUser = await authRepository.findUserByEmail(profile.email);
    const authData = await issueAuthTokens({ ...newUser, id: userId });

    return {
      ...authData,
      message: "Google sign-up successful.",
      is_new_user: true,
    };
  }

  if (!existingGoogleUser) {
    if (existingEmailUser && existingEmailUser.auth_provider !== "google") {
      const error = new Error(
        "This email is registered with password sign-in. Use your email and password instead."
      );
      error.statusCode = 400;
      throw error;
    }

    const error = new Error(
      "No account was found for this Google email. Create an account first."
    );
    error.statusCode = 404;
    throw error;
  }

  const authData = await issueAuthTokens(existingGoogleUser);
  return {
    ...authData,
    message: "Google sign-in successful.",
    is_new_user: false,
  };
}

module.exports = {
  register,
  verifyOtp,
  resendVerificationOtp,
  login,
  forgotPassword,
  verifyPasswordResetOtp,
  resetPassword,
  googleAuth,
};
