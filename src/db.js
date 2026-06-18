const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../market.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    discriminator TEXT,
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,
    category TEXT NOT NULL,
    images TEXT DEFAULT '[]',
    status TEXT DEFAULT 'selling',
    trade_type TEXT DEFAULT 'direct',
    trade_location TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// 기존 DB에 컬럼이 없을 경우 추가
try { db.exec(`ALTER TABLE items ADD COLUMN trade_type TEXT DEFAULT 'direct'`); } catch {}
try { db.exec(`ALTER TABLE items ADD COLUMN trade_location TEXT DEFAULT ''`); } catch {}

module.exports = db;
