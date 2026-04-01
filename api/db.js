const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

// @neondatabase/serverless requires an explicit WebSocket constructor
// when running in Node.js (Vercel serverless functions).
neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is missing. Add it in Vercel Settings > Environment Variables.");
}

const pool = new Pool({ connectionString: DATABASE_URL });

module.exports = { pool };
