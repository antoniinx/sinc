const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database file in the project directory
const dbPath = path.join(__dirname, '..', 'database', 'shared_calendar.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    // Initialize tables if they don't exist
    initDatabase();
  }
});

function initDatabase() {
  const createTables = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar TEXT,
      notifications BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      contact_user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (contact_user_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(user_id, contact_user_id)
    );

    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#3B82F6',
      owner_id INTEGER,
      is_public INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS group_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER,
      user_id INTEGER,
      role TEXT DEFAULT 'member',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(group_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER,
      creator_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      time TEXT,
      end_date TEXT,
      end_time TEXT,
      location TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
      FOREIGN KEY (creator_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS event_attendees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER,
      user_id INTEGER,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(event_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER,
      user_id INTEGER,
      text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS event_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      created_by INTEGER NOT NULL,
      assignee_id INTEGER,
      status TEXT DEFAULT 'open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
      FOREIGN KEY (assignee_id) REFERENCES users (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS friendships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      friend_id INTEGER,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (friend_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(user_id, friend_id)
    );
  `;

  db.exec(createTables, (err) => {
    if (err) {
      console.error('Error creating tables:', err.message);
    } else {
      console.log('Database tables initialized successfully');
      // Run migrations to add missing columns
      runMigrations();
    }
  });
}

function runMigrations() {
  // Add missing columns to existing tables
  const migrations = [
    "ALTER TABLE groups ADD COLUMN description TEXT",
    "ALTER TABLE groups ADD COLUMN color TEXT DEFAULT '#3B82F6'",
    "ALTER TABLE groups ADD COLUMN is_public INTEGER DEFAULT 0",
    "ALTER TABLE users ADD COLUMN avatar TEXT",
    "ALTER TABLE users ADD COLUMN notifications BOOLEAN DEFAULT 1",
    "ALTER TABLE events ADD COLUMN end_date TEXT",
    "ALTER TABLE events ADD COLUMN end_time TEXT"
  ];

  migrations.forEach((migration, index) => {
    db.run(migration, (err) => {
      if (err) {
        // Column might already exist, which is fine
        console.log(`Migration ${index + 1} skipped (column might already exist):`, err.message);
      } else {
        console.log(`Migration ${index + 1} completed successfully`);
      }
    });
  });
}

// Helper function to run queries with promises
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve({ rows });
      }
    });
  });
}

// Helper function to run single row queries
function queryOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve({ rows: row ? [row] : [] });
      }
    });
  });
}

// Helper function to run insert/update/delete queries
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ 
          rows: [{ id: this.lastID }],
          rowCount: this.changes 
        });
      }
    });
  });
}

module.exports = {
  query,
  queryOne,
  run,
  db
};
