import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import db from "./database";
import router from "./routes";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(router);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  const sqlDir = path.join(__dirname, "sql");
  if (!fs.existsSync(sqlDir)) {
    fs.mkdirSync(sqlDir);
    console.log("📁 Created missing SQL directory.");
    return;
  }

  const sqlFiles = fs.readdirSync(sqlDir);
  for (const file of sqlFiles) {
    const query = fs.readFileSync(path.join(sqlDir, file), "utf8");
    try {
      await db.query(query);
      console.log(`🗃️ Executed: ${file}`);
    } catch (err) {
      console.error(`❌ Error executing ${file}:`, err);
    }
  }
}

await initializeDatabase();
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
