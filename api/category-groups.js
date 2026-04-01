const { pool } = require('./db.js');

module.exports = async function handler(req, res) {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set in Vercel Environment Variables! Please add it in your project Settings > Environment Variables.");
    }

    let page = req.query?.pagination?.page || req.query['pagination[page]'] ? parseInt(req.query?.pagination?.page || req.query['pagination[page]']) : 1;
    let pageSize = req.query?.pagination?.pageSize || req.query['pagination[pageSize]'] ? parseInt(req.query?.pagination?.pageSize || req.query['pagination[pageSize]']) : 90;

    const opFilters = (req.query?.filters && req.query.filters.Remark && req.query.filters.Remark['$ne']) || req.query['filters[Remark][$ne]'];
    const hasUnpublishedFilter = opFilters === 'Unpublished';

    let resultRows = [];
    let countRows = [];

    const offset = (page - 1) * pageSize;

    if (hasUnpublishedFilter) {
       const resQuery = await pool.query(
         `SELECT id, kumpulan_kategori as "KumpulanKategori", group_category as "GroupCategory", remark as "Remark" 
          FROM category_groups 
          WHERE remark IS NULL OR remark != 'Unpublished'
          LIMIT $1 OFFSET $2`, 
         [pageSize, offset]
       );
       resultRows = resQuery.rows;

       const resCount = await pool.query(
         `SELECT count(*) as total FROM category_groups WHERE remark IS NULL OR remark != 'Unpublished'`
       );
       countRows = resCount.rows;
    } else {
       const resQuery = await pool.query(
         `SELECT id, kumpulan_kategori as "KumpulanKategori", group_category as "GroupCategory", remark as "Remark" 
          FROM category_groups 
          LIMIT $1 OFFSET $2`, 
         [pageSize, offset]
       );
       resultRows = resQuery.rows;

       const resCount = await pool.query(`SELECT count(*) as total FROM category_groups`);
       countRows = resCount.rows;
    }

    const total = parseInt(countRows[0].total);
    const pageCount = Math.ceil(total / pageSize) || 1;

    res.status(200).json({
      data: resultRows.map(row => ({
         id: row.id,
         attributes: {
           KumpulanKategori: row.KumpulanKategori,
           GroupCategory: row.GroupCategory,
           Remark: row.Remark
         },
         // Some frontend code expects flat structure, we attach it here for compatibility
         KumpulanKategori: row.KumpulanKategori,
         GroupCategory: row.GroupCategory,
         Remark: row.Remark
      })),
      meta: {
        pagination: { page, pageSize, pageCount, total }
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};
