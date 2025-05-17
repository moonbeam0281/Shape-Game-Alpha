const pg = require('pg');

const pool = new pg.Pool({connectionString: 'postgres://moonbeam:admin@localhost:5432/shapedb'});

module.exports = pool;