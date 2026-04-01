require('dotenv').config();
const { pool } = require('./api/db.js');

async function populateImageUrls() {
  try {
    // Get all bims
    const res = await pool.query('SELECT id, perkataan FROM bims');
    const bims = res.rows;

    for (const bim of bims) {
      // Assume blob URL pattern
      const imageUrl = `https://bimsignbank.blob.vercel.app/vocab/${bim.perkataan}.jpg`;

      await pool.query('UPDATE bims SET image_url = $1 WHERE id = $2', [imageUrl, bim.id]);
      console.log(`Updated ${bim.perkataan} with ${imageUrl}`);
    }

    console.log('Done populating image URLs');
  } catch(e) { console.error(e) }
  process.exit(0);
}

populateImageUrls();