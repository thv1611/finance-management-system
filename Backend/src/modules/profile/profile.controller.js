const { successResponse } = require("../../utils/response");
const profileService = require("./profile.service");

async function getProfileController(req, res, next) {
  try {
    const profile = await profileService.getProfile(req.user.id);
    return successResponse(res, "Profile retrieved successfully", profile, 200);
  } catch (error) {
    next(error);
  }
}

async function updateProfileController(req, res, next) {
  try {
    const profile = await profileService.updateProfile(req.user.id, req.body);
    return successResponse(res, "Profile updated successfully", profile, 200);
  } catch (error) {
    next(error);
  }
}

async function changePasswordController(req, res, next) {
  try {
    await profileService.changePassword(req.user.id, req.body);
    return successResponse(res, "Password updated successfully", null, 200);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfileController,
  updateProfileController,
  changePasswordController,
};
