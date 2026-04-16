const dotenv = require("dotenv");

dotenv.config();

const requiredEnvKeys = [
  "MAIL_HOST",
  "MAIL_PORT",
  "MAIL_USER",
  "MAIL_PASS",
  "MAIL_FROM",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "JWT_ACCESS_EXPIRES",
  "JWT_REFRESH_EXPIRES",
];

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const databaseConfigKeys = hasDatabaseUrl
  ? []
  : ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];

const missingEnvKeys = [...databaseConfigKeys, ...requiredEnvKeys].filter(
  (key) => !process.env[key]
);

if (missingEnvKeys.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvKeys.join(", ")}`
  );
}

module.exports = {
  port: process.env.PORT || 5000,
  db: {
    connectionString: process.env.DATABASE_URL || "",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  mail: {
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  },
  otp: {
    expiresMinutes: Number(process.env.OTP_EXPIRES_MINUTES || 5),
    resendCooldownSeconds: Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 60),
  },
};
