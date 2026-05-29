const app = require("./app");
const pool = require("./db/connection");
const env = require("./config/env");
const { getEmailProviderLabel } = require("./config/mail");
const { initializeDatabase } = require("./db/init");

function maskValue(value) {
  if (!value) {
    return "not set";
  }

  if (value.length <= 16) {
    return `${value.slice(0, 4)}...`;
  }

  return `${value.slice(0, 10)}...${value.slice(-24)}`;
}

async function startServer() {
  try {
    await initializeDatabase(pool);
    const connection = await pool.connect();
    console.log("Database connected and initialized successfully");
    connection.release();

    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
      console.log(`Email provider: ${getEmailProviderLabel()}`);
      console.log(`Google client ID: ${maskValue(env.google.clientId)}`);
      console.log(`Google client secret: ${env.google.clientSecret ? "set" : "not set"}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    await pool.end().catch(() => {});
    process.exitCode = 1;
  }
}

startServer();
