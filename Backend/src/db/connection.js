const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

function getConnectionString() {
  if (!process.env.DATABASE_URL) {
    return "";
  }

  const connectionUrl = new URL(process.env.DATABASE_URL);
  connectionUrl.searchParams.delete("channel_binding");
  return connectionUrl.toString();
}

const connectionString = getConnectionString();

const pool = new Pool(
  connectionString
    ? {
        connectionString,
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: false,
      }
);

module.exports = pool;
