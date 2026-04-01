// Debug endpoint: introspects DB schema and tests basic bims query
const { pool } = require('./db.js');

module.exports = async function handler(req, res) {
  const results = {};

  // 1. List all tables
  try {
    const r = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`);
    results.tables = r.rows.map(x => x.table_name);
  } catch (e) { results.tables_error = e.message; }

  // 2. bims columns
  try {
    const r = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='bims' ORDER BY ordinal_position`);
    results.bims_columns = r.rows;
  } catch (e) { results.bims_columns_error = e.message; }

  // 3. category_groups columns
  try {
    const r = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='category_groups' ORDER BY ordinal_position`);
    results.category_groups_columns = r.rows;
  } catch (e) { results.category_groups_columns_error = e.message; }

  // 4. links table columns (correct name)
  try {
    const r = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name='bims_category_group_lnk'`);
    results.links_columns = r.rows;
  } catch (e) { results.links_columns_error = e.message; }

  // 5. Simple bims fetch (no joins, no special columns)
  try {
    const r = await pool.query(`SELECT * FROM bims LIMIT 1`);
    results.bims_sample = r.rows;
  } catch (e) { results.bims_sample_error = e.message; }

  // 6. Full bims join (same as bims.js) — catch error separately
  try {
    const r = await pool.query(`
      SELECT bims.id, bims.perkataan, bims.word, bims.tag,
             bims."order", bims.new, bims.video,
             bims.image_status, bims.video_status,
             bims.remark, bims.created_at,
             cg.id as cg_id, cg.kumpulan_kategori, cg.group_category
      FROM bims
      LEFT JOIN bims_category_group_lnk links ON bims.id = links.bim_id
      LEFT JOIN category_groups cg ON links.category_group_id = cg.id
      LIMIT 1
    `);
    results.bims_full_join = r.rows;
  } catch (e) { results.bims_full_join_error = e.message; }

  res.status(200).json(results);
};
