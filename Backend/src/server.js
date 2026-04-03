const app = require("./app");
const pool = require("./db/connection");
const env = require("./config/env");

async function startServer() {
  try {
    const connection = await pool.getConnection();
    console.log("Database connected successfully");
    connection.release();

    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
}

startServer();