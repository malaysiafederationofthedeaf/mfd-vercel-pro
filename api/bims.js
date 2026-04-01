const { pool } = require('./db.js');

module.exports = async function handler(req, res) {
  try {
    const { pagination, filters, sort, populate } = req.query;

    let page = 1;
    let limit = 25;

    if (pagination) {
      if (pagination.page) page = parseInt(pagination.page);
      if (pagination.pageSize) limit = parseInt(pagination.pageSize);
      if (pagination.limit) limit = parseInt(pagination.limit);
    }

    const offset = (page - 1) * limit;

    let baseQuery = `
      SELECT bims.id as "id", 
             bims.perkataan as "Perkataan", 
             bims.word as "Word", 
             bims.tag as "Tag", 
             bims."order" as "Order", 
             bims.new as "New", 
             bims.video as "Video", 
             bims.image_status as "Image_Status", 
             bims.video_status as "Video_Status", 
             bims.remark as "Remark",
             bims.created_at as "createdAt",
             cg.id as "cg_id", 
             cg.kumpulan_kategori as "KumpulanKategori", 
             cg.group_category as "GroupCategory", 
             cg.remark as "cg_Remark"
      FROM bims
      LEFT JOIN bims_category_group_links links ON bims.id = links.bim_id
      LEFT JOIN category_groups cg ON links.category_group_id = cg.id
      WHERE 1=1
    `;

    let countQuery = `
      SELECT count(*) as total
      FROM bims
      LEFT JOIN bims_category_group_links links ON bims.id = links.bim_id
      LEFT JOIN category_groups cg ON links.category_group_id = cg.id
      WHERE 1=1
    `;

    const values = [];
    const countValues = [];
    let paramIndex = 1;

    // Build filters dynamically
    if (filters) {
      if (filters.category_group && filters.category_group.GroupCategory && filters.category_group.GroupCategory['$eq']) {
        baseQuery += ` AND cg.group_category = $${paramIndex}`;
        countQuery += ` AND cg.group_category = $${paramIndex}`;
        values.push(filters.category_group.GroupCategory['$eq']);
        countValues.push(filters.category_group.GroupCategory['$eq']);
        paramIndex++;
      }

      if (filters.New && filters.New['$eq']) {
        baseQuery += ` AND bims.new = $${paramIndex}`;
        countQuery += ` AND bims.new = $${paramIndex}`;
        values.push(filters.New['$eq']);
        countValues.push(filters.New['$eq']);
        paramIndex++;
      }

      const exactFilterKeys = ['Word', 'Perkataan', 'Tag'];
      for (const key of exactFilterKeys) {
        if (filters[key]) {
          if (filters[key]['$containsi']) {
            baseQuery += ` AND bims.${key.toLowerCase()} ILIKE $${paramIndex}`;
            countQuery += ` AND bims.${key.toLowerCase()} ILIKE $${paramIndex}`;
            values.push(`%${filters[key]['$containsi']}%`);
            countValues.push(`%${filters[key]['$containsi']}%`);
            paramIndex++;
          }
          if (filters[key]['$startsWith']) {
            baseQuery += ` AND bims.${key.toLowerCase()} ILIKE $${paramIndex}`;
            countQuery += ` AND bims.${key.toLowerCase()} ILIKE $${paramIndex}`;
            values.push(`${filters[key]['$startsWith']}%`);
            countValues.push(`${filters[key]['$startsWith']}%`);
            paramIndex++;
          }
        }
      }
    }

    // Sort Support
    if (sort === 'createdAt:desc') {
      baseQuery += ` ORDER BY bims.created_at DESC`;
    } else {
      // Default sort
      baseQuery += ` ORDER BY bims.id ASC`;
    }

    // Pagination Support
    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const [resQuery, resCount] = await Promise.all([
      pool.query(baseQuery, values),
      pool.query(countQuery, countValues)
    ]);

    const total = parseInt(resCount.rows[0].total);
    const pageCount = Math.ceil(total / limit) || 1;

    // Formatting as Strapi JSON
    const data = resQuery.rows.map(row => {
      const attributes = {
        Perkataan: row.Perkataan,
        Word: row.Word,
        Tag: row.Tag,
        Order: row.Order,
        New: row.New,
        Video: row.Video,
        Image_Status: row.Image_Status,
        Video_Status: row.Video_Status,
        Remark: row.Remark,
        createdAt: row.createdAt
      };

      if (row.cg_id) {
        attributes.category_group = {
          data: {
            id: row.cg_id,
            attributes: {
              KumpulanKategori: row.KumpulanKategori,
              GroupCategory: row.GroupCategory,
              Remark: row.cg_Remark
            }
          }
        };
      } else {
        attributes.category_group = { data: null };
      }

      return {
        id: row.id,
        attributes: attributes,
        // Flat structures appended for frontend compatibility if necessary
        ...attributes
      };
    });

    res.status(200).json({
      data: data,
      meta: {
        pagination: { page, pageSize: limit, pageCount, total }
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};
