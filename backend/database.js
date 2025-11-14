const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db = null;

async function initDatabase() {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(__dirname, 'meettranscribe.db');
    db = new sqlite3.Database(dbPath, async (err) => {
      if (err) return reject(err);
      try {
        await createTables();
        console.log('✅ Database initialized at', dbPath);
        resolve(db);
      } catch (error) {
        reject(error);
      }
    });
  });
}

function createTables() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // voice_profiles
      db.run(`
        CREATE TABLE IF NOT EXISTS voice_profiles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          voice_sample TEXT,
          avg_frequency REAL,
          avg_amplitude REAL,
          mfcc_coefficients TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_deleted INTEGER DEFAULT 0
        )
      `);

      // transcripts
      db.run(`
        CREATE TABLE IF NOT EXISTS transcripts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          speaker_count INTEGER,
          language TEXT,
          detection_mode TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          total_duration INTEGER,
          word_count INTEGER,
          is_deleted INTEGER DEFAULT 0
        )
      `);

      // transcript_messages
      db.run(`
        CREATE TABLE IF NOT EXISTS transcript_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          transcript_id INTEGER,
          speaker_name TEXT,
          message_text TEXT,
          timestamp_ms INTEGER,
          confidence_score REAL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (transcript_id) REFERENCES transcripts(id)
        )
      `);

      // attendees
      db.run(`
        CREATE TABLE IF NOT EXISTS attendees (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          transcript_id INTEGER,
          name TEXT,
          email TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (transcript_id) REFERENCES transcripts(id)
        )
      `);

      // meeting_summary
      db.run(`
        CREATE TABLE IF NOT EXISTS meeting_summary (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          transcript_id INTEGER,
          summary_text TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (transcript_id) REFERENCES transcripts(id)
        )
      `);

      // tasks
      db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          transcript_id INTEGER,
          attendee_id INTEGER,
          task_text TEXT,
          due_date TEXT,
          status TEXT DEFAULT 'open',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (transcript_id) REFERENCES transcripts(id),
          FOREIGN KEY (attendee_id) REFERENCES attendees(id)
        )
      `, (err) => {
        if (err) return reject(err);

        // Indexes
        db.run(`CREATE INDEX IF NOT EXISTS idx_profiles_name ON voice_profiles(name)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_transcripts_created ON transcripts(created_at)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_messages_transcript ON transcript_messages(transcript_id)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_attendees_transcript ON attendees(transcript_id)`);
        resolve();
      });
    });
  });
}

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function getOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function getAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

module.exports = { initDatabase, runQuery, getOne, getAll };
