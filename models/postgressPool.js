let ssl = null;
if (process.env.NODE_ENV === "development") {
  ssl = { rejectUnauthorized: false };
}
const databaseConfig = {
  host: process.env.DB_HOST,
  port: 5432,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: ssl,
};
const pgp = require("pg-promise")({});
const db = pgp(databaseConfig);
module.exports = { db };
