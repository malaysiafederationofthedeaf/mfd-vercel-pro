require('dotenv').config();
const { pool } = require('./api/db.js');

async function test() {
  try {
    const res = await pool.query('SELECT word, perkataan FROM bims WHERE word ILIKE $1 OR perkataan ILIKE $1 LIMIT 5', ['%abu%']);
    console.log(res.rows);
  } catch(e) { console.error(e) }
  process.exit(0);
}
test();
