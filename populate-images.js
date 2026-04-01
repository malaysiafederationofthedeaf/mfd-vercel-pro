require('dotenv').config();
const { pool } = require('./api/db.js');

async function populateImageUrls() {
  try {
    // Get all bims that don't have image_url set
    const res = await pool.query('SELECT id, perkataan FROM bims WHERE image_url IS NULL OR image_url = \'\'');
    const bims = res.rows;

    if (bims.length === 0) {
      console.log('All bims already have image URLs set.');
      return;
    }

    console.log(`Found ${bims.length} bims without image URLs. Populating...`);

    // Get blob base URL from environment
    const blobBaseUrl = process.env.REACT_APP_BLOB_BASE_URL || 'https://your-blob-store.vercel.app';

    for (const bim of bims) {
      // Create blob URL - assuming images are stored as vocab/{perkataan}.jpg
      const imageUrl = `${blobBaseUrl}/vocab/${encodeURIComponent(bim.perkataan)}.jpg`;

      await pool.query('UPDATE bims SET image_url = $1 WHERE id = $2', [imageUrl, bim.id]);
      console.log(`✅ Updated ${bim.perkataan} with ${imageUrl}`);
    }

    console.log(`🎉 Successfully populated ${bims.length} image URLs!`);
  } catch(e) {
    console.error('❌ Error populating image URLs:', e);
  } finally {
    process.exit(0);
  }
}

populateImageUrls();