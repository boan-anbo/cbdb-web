const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Create a small test database
const dbPath = path.join(__dirname, 'test-database.db');
const db = new Database(dbPath);

// Create a simple table
db.exec(`
  CREATE TABLE IF NOT EXISTS test_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    value INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Insert some test data
const insert = db.prepare('INSERT INTO test_data (name, value) VALUES (?, ?)');
for (let i = 1; i <= 10; i++) {
  insert.run(`Test Item ${i}`, i * 100);
}

db.close();

console.log(`Test database created at: ${dbPath}`);
console.log(`Size: ${fs.statSync(dbPath).size} bytes`);