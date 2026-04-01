const { pool } = require('./db.js');

module.exports = async function handler(req, res) {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set in Vercel. Please set it in Settings > Environment Variables!");
    }

    let page = req.query?.pagination?.page || req.query['pagination[page]'] ? parseInt(req.query?.pagination?.page || req.query['pagination[page]']) : 1;
    let limit = 25;
    if (req.query?.pagination?.pageSize || req.query['pagination[pageSize]']) limit = parseInt(req.query?.pagination?.pageSize || req.query['pagination[pageSize]']);
    else if (req.query?.pagination?.limit || req.query['pagination[limit]']) limit = parseInt(req.query?.pagination?.limit || req.query['pagination[limit]']);

    const offset = (page - 1) * limit;

    let filters = {};
    if (req.query.filters && typeof req.query.filters === 'object') {
      filters = req.query.filters;
    } else {
      for (const key of Object.keys(req.query)) {
        const match = key.match(/filters\[(.*?)\](\[(.*?)\])?/);
        if (match) {
          const field = match[1];
          let op = match[3] || '$eq';
          
          if (field === 'category_group' && match[3]) {
            const deepMatch = key.match(/filters\[category_group\]\[(.*?)\]\[(.*?)\]/);
            if (deepMatch) {
              filters.category_group = filters.category_group || {};
              filters.category_group[deepMatch[1]] = filters.category_group[deepMatch[1]] || {};
              filters.category_group[deepMatch[1]][deepMatch[2]] = req.query[key];
            }
          } else {
            filters[field] = filters[field] || {};
            filters[field][op] = req.query[key];
          }
        }
      }
    }
    const sort = req.query.sort;

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
          KumpulanKategori: row.KumpulanKategori,
          GroupCategory: row.GroupCategory,
          Remark: row.cg_Remark,
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
        ...attributes,
        id: row.id,
        attributes: attributes
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
