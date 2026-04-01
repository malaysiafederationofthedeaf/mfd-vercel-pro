process.env.DATABASE_URL = "postgresql://neondb_owner:npg_GU50CdAsjfra@ep-tiny-bar-a182ndsl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const handler = require('./api/category-groups.js');
const handlerBims = require('./api/bims.js');

async function run() {
    let resData = null;
    const res = {
        status: (code) => ({
            json: (data) => {
                resData = { code, data };
                console.log(JSON.stringify(resData, null, 2));
            }
        })
    };

    console.log("Testing category-groups...");
    await handler({ query: { pagination: { page: 1, pageSize: 5 } } }, res);

    console.log("Testing bims...");
    await handlerBims({ query: { pagination: { page: 1, limit: 1 }, sort: 'createdAt:desc'} }, res);
}
run();
