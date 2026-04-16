const app = require("./app");
const pool = require("./db/connection");
const env = require("./config/env");
const { initializeDatabase } = require("./db/init");

async function startServer() {
  try {
    await initializeDatabase(pool);
    const connection = await pool.connect();
    console.log("Database connected and initialized successfully");
    connection.release();

    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
}

startServer();
