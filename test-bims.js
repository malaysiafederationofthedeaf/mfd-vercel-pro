require('dotenv').config();
const handler = require('./api/bims.js');

const req = {
  query: {
    'populate': '*',
    'filters[Word][$containsi]': 'Keluarga'
  }
};

const res = {
  status: (code) => ({
    json: (data) => console.log('STATUS:', code, JSON.stringify(data, null, 2))
  })
};

handler(req, res).catch(console.error);
