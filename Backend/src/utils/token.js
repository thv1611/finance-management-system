const jwt = require("jsonwebtoken");
const env = require("../config/env");

function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    env.jwt.accessSecret,
    {
      expiresIn: env.jwt.accessExpiresIn,
    }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    env.jwt.refreshSecret,
    {
      expiresIn: env.jwt.refreshExpiresIn,
    }
  );
}

function decodeJwtExpiry(token) {
  const decoded = jwt.decode(token);
  if (!decoded || !decoded.exp) return null;
  return new Date(decoded.exp * 1000);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  decodeJwtExpiry,
};