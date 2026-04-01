// Quick debug endpoint to check actual data in DB
const { pool } = require('./db.js');

module.exports = async function handler(req, res) {
  try {
    // Get sample category_groups to see actual values
    const cg = await pool.query(`SELECT id, group_category, kumpulan_kategori FROM category_groups LIMIT 20`);
    
    // Get sample bims with their category group joins
    const bims = await pool.query(`
      SELECT b.word, b.perkataan, cg.group_category, cg.kumpulan_kategori
      FROM bims b
      LEFT JOIN bims_category_group_links l ON b.id = l.bim_id
      LEFT JOIN category_groups cg ON l.category_group_id = cg.id
      LIMIT 10
    `);

    res.status(200).json({
      category_groups_sample: cg.rows,
      bims_sample: bims.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
