const { neon } = require('@neondatabase/serverless');

// Use the HTTP-based neon() function instead of Pool/WebSockets.
// Pool with WebSockets is unreliable in Vercel Node.js serverless functions.
// The neon() HTTP client is stateless, works perfectly in serverless, and
// returns results in the same { rows } format as pg's Pool.query().

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is missing. Add it in Vercel Settings > Environment Variables.");
}

const sql = neon(DATABASE_URL);

// Expose a pool-compatible interface so bims.js and category-groups.js
// don't need to change — pool.query(text, values) still works the same way.
const pool = {
  query: (text, values) => sql.query(text, values)
};

module.exports = { pool };
