const { Pool } = require('pg');

// Use the standard 'pg' library which uses TCP+TLS — works reliably
// in all Node.js environments including Vercel serverless functions.
// No WebSocket required.

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is missing. " +
    "Add it in Vercel Settings > Environment Variables."
  );
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Neon's TLS connection
  max: 1,                             // keep connections minimal in serverless
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});

module.exports = { pool };
