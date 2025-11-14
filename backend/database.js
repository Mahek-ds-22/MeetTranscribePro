const sqlite3 = require("sqlite3").verbose();
const path = require("path");

let db;

function initDatabase() {
  return new Promise((resolve, reject) => {
    const dbPath = process.env.DB_PATH || path.join(__dirname, "meettranscribe.db");
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);

      db.serialize(() => {
        db.run(`
          CREATE TABLE IF NOT EXISTS transcripts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            speaker_count INTEGER,
            language TEXT,
            detection_mode TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS transcript_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transcript_id INTEGER,
            speaker_name TEXT,
            message_text TEXT,
            timestamp_ms INTEGER
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS attendees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transcript_id INTEGER,
            name TEXT,
            email TEXT
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transcript_id INTEGER,
            attendee_id INTEGER,
            task_text TEXT,
            due_date TEXT,
            status TEXT DEFAULT 'open'
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS meeting_summary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transcript_id INTEGER,
            summary_text TEXT
          )
        `);

        resolve();
      });
    });
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID });
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function one(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
}

module.exports = { initDatabase, run, all, one };
