// Set DATABASE_URL first
process.env.DATABASE_URL = "postgresql://neondb_owner:npg_GU50CdAsjfra@ep-tiny-bar-a182ndsl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const bimsHandler = require('./api/bims.js');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

async function run() {
    let req = { query: {} };
    let jsonResult = null;
    let statusCode = null;

    let res = {
        status: (code) => {
            statusCode = code;
            return {
                json: (data) => {
                    jsonResult = data;
                }
            };
        }
    };

    console.log("Calling handler...");
    await bimsHandler(req, res);
    console.log("Status:", statusCode);
    if (statusCode === 500) {
        console.log("Error:", jsonResult);
    } else {
        console.log("Success! Data length:", jsonResult.data.length);
    }
}
run();
