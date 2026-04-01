const { neon, Pool, neonConfig } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is missing. " +
    "Add it in Vercel Settings > Environment Variables."
  );
}

// Detect if connectionstring uses the pooler endpoint (has '-pooler.' in host).
// Pooler endpoints only support WebSocket/Postgres protocol.
// Non-pooler (direct) endpoints support both WebSocket AND neon() HTTP.
const isPoolerUrl = DATABASE_URL.includes('-pooler.');

let pool;

if (isPoolerUrl) {
  // For pooler URLs: use Pool with WebSocket.
  // Node 22+ has globalThis.WebSocket built-in.
  if (typeof globalThis.WebSocket !== 'undefined') {
    neonConfig.webSocketConstructor = globalThis.WebSocket;
  } else {
    try { neonConfig.webSocketConstructor = require('ws'); } catch (e) {}
  }
  pool = new Pool({ connectionString: DATABASE_URL });
  pool.query = pool.query.bind(pool);
} else {
  // For direct (non-pooler) URLs: use neon() HTTP client which is simpler.
  // Wrap it in a pool-compatible interface.
  const sql = neon(DATABASE_URL);
  pool = {
    query: async (text, params = []) => {
      // neon().query() returns a pg-compatible {rows: [...]} object
      return sql.query(text, params);
    }
  };
}

module.exports = { pool };
