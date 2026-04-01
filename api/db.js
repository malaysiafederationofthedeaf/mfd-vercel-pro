const { Pool } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is missing.");
}

const pool = new Pool({ connectionString: DATABASE_URL });

module.exports = { pool };
