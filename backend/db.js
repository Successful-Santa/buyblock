import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "db.json");
const initSqlPath = path.join(__dirname, "sql", "sqlite-init.sql");

// Try to use sqlite if available; otherwise fall back to a simple JSON file DB.
let useSqlite = false;
let sqlite;
let openSqlite;

try {
  // dynamic require-ish import for optional dependency
  // eslint-disable-next-line no-eval
  sqlite = eval("require")("sqlite3");
  openSqlite = eval("require")("sqlite").open;
  useSqlite = true;
} catch (e) {
  useSqlite = false;
}

let db;

async function initSqlite() {
  if (db) return db;
  const sqlite3 = sqlite;
  const open = openSqlite;
  const file = path.join(__dirname, "db.sqlite");
  db = await open({ filename: file, driver: sqlite3.Database });
  // run init SQL if exists (best-effort)
  if (fs.existsSync(initSqlPath)) {
    const initSql = fs.readFileSync(initSqlPath, "utf8");
    await db.exec(initSql);
  }
  return db;
}

// Simple JSON-file DB fallback
function readJsonDb() {
  if (!fs.existsSync(dbPath)) {
    const initial = { parcels: [], ownership_history: [], checkpoints: {} };
    fs.writeFileSync(dbPath, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function writeJsonDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

async function query(sql, params = []) {
  // If sqlite is available, use it and normalize result shape to { rows, rowCount }
  if (useSqlite) {
    const conn = await initSqlite();
    const stmt = sql.trim().toLowerCase();
    if (stmt.startsWith("select")) {
      const rows = await conn.all(sql, params);
      return { rows, rowCount: rows.length };
    } else {
      const res = await conn.run(sql, params);
      return { res, rowCount: res.changes || 0 };
    }
  }

  // fallback JSON behaviour for a few common queries used by the app
  const dbJson = readJsonDb();
  const q = sql.trim().toLowerCase();
  if (q.startsWith("select parcel_id, geojson, owner from parcels")) {
    const rows = dbJson.parcels.map((p) => ({
      parcel_id: p.parcel_id,
      geojson: p.geojson,
      owner: p.owner,
    }));
    return { rows, rowCount: rows.length };
  }
  if (q.startsWith("select * from parcels where parcel_id")) {
    const id = params[0];
    const found = dbJson.parcels.filter(
      (p) => String(p.parcel_id) === String(id)
    );
    return { rows: found, rowCount: found.length };
  }
  if (q.startsWith("select * from ownership_history where parcel_id")) {
    const id = params[0];
    const rows = dbJson.ownership_history.filter(
      (h) => String(h.parcel_id) === String(id)
    );
    // order by id desc
    rows.sort((a, b) => (b.id || 0) - (a.id || 0));
    return { rows, rowCount: rows.length };
  }

  // handle basic upsert used by indexer
  if (q.startsWith("insert into parcels")) {
    const [parcel_id, geojson, doc_hash, owner] = params;
    const existing = dbJson.parcels.find(
      (p) => String(p.parcel_id) === String(parcel_id)
    );
    if (existing) {
      existing.owner = owner;
    } else {
      dbJson.parcels.push({
        parcel_id,
        geojson: JSON.parse(geojson),
        doc_hash: doc_hash ? Buffer.from(doc_hash).toString("hex") : null,
        owner,
        registered_at: new Date().toISOString(),
      });
    }
    writeJsonDb(dbJson);
    return { rowCount: 1 };
  }

  if (q.startsWith("insert into ownership_history")) {
    const [parcel_id, previous_owner, new_owner] = params;
    const id =
      (dbJson.ownership_history.length
        ? dbJson.ownership_history[dbJson.ownership_history.length - 1].id
        : 0) + 1;
    dbJson.ownership_history.push({
      id,
      parcel_id,
      previous_owner,
      new_owner,
      changed_at: new Date().toISOString(),
    });
    writeJsonDb(dbJson);
    return { rowCount: 1 };
  }

  if (q.startsWith("update parcels set owner")) {
    const [owner, parcel_id] = params;
    const existing = dbJson.parcels.find(
      (p) => String(p.parcel_id) === String(parcel_id)
    );
    if (existing) {
      existing.owner = owner;
      writeJsonDb(dbJson);
      return { rowCount: 1 };
    }
    return { rowCount: 0 };
  }

  // checkpoints upsert
  if (q.startsWith("insert into checkpoints")) {
    const [id, block] = params;
    dbJson.checkpoints[id] = Number(block);
    writeJsonDb(dbJson);
    return { rowCount: 1 };
  }

  // fallback: return empty
  return { rows: [], rowCount: 0 };
}

export { query };
