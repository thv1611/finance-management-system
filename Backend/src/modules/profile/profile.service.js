const bcrypt = require("bcryptjs");
const profileRepository = require("./profile.repository");

async function getProfile(userId) {
  const profile = await profileRepository.findProfileByUserId(userId);

  if (!profile) {
    const error = new Error("Profile not found");
    error.statusCode = 404;
    throw error;
  }

  return profile;
}

async function updateProfile(userId, payload) {
  const fullName = String(payload.full_name || "").trim();
  const avatarUrl = String(payload.avatar_url || "").trim();

  if (!fullName) {
    const error = new Error("Full name is required");
    error.statusCode = 400;
    throw error;
  }

  const updatedProfile = await profileRepository.updateProfileByUserId(userId, {
    fullName,
    avatarUrl,
  });

  if (!updatedProfile) {
    const error = new Error("Profile not found");
    error.statusCode = 404;
    throw error;
  }

  return updatedProfile;
}

async function changePassword(userId, payload) {
  const currentPassword = String(payload.current_password || "");
  const newPassword = String(payload.new_password || "");

  const profile = await profileRepository.findProfileByUserId(userId);

  if (!profile) {
    const error = new Error("Profile not found");
    error.statusCode = 404;
    throw error;
  }

  if (profile.auth_provider === "google") {
    const error = new Error("This account uses Google Sign-In and cannot change password here.");
    error.statusCode = 400;
    throw error;
  }

  const userWithPassword = await profileRepository.findProfileCredentialsByUserId(userId);

  if (!userWithPassword) {
    const error = new Error("Profile not found");
    error.statusCode = 404;
    throw error;
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    userWithPassword.password_hash
  );

  if (!isCurrentPasswordValid) {
    const error = new Error("Current password is incorrect");
    error.statusCode = 400;
    throw error;
  }

  const nextPasswordHash = await bcrypt.hash(newPassword, 10);
  await profileRepository.updatePasswordByUserId(userId, nextPasswordHash);
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
