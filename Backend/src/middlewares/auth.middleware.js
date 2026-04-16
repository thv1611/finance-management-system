const { verifyAccessToken } = require("../utils/token");

function requireAuth(req, res, next) {
  const authorizationHeader = req.headers.authorization || "";
  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    const error = new Error("Authentication required");
    error.statusCode = 401;
    return next(error);
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.userId,
      email: payload.email,
    };
    return next();
  } catch (err) {
    const error = new Error("Invalid or expired access token");
    error.statusCode = 401;
    return next(error);
  }
}

module.exports = {
  requireAuth,
};
