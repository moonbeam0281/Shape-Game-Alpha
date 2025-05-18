import { Pool } from "pg";

const pool = new Pool({
  connectionString:
    process.env.CONNECTION_STRING ??
    "postgres://moonbeam:admin@localhost:5432/shapedb",
});

export default pool;
