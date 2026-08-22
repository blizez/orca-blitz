import { app } from 'electron'
import { mkdirSync } from 'fs'
import { join } from 'path'
import { DatabaseSync } from 'node:sqlite'

const schema = `
CREATE TABLE IF NOT EXISTS sessions (
  business_id TEXT PRIMARY KEY,
  phone TEXT,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected',
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS contacts (
  business_id TEXT NOT NULL,
  jid TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  name TEXT,
  pushname TEXT,
  is_group INTEGER NOT NULL DEFAULT 0,
  unread_count INTEGER NOT NULL DEFAULT 0,
  last_message_at INTEGER,
  PRIMARY KEY (business_id, jid)
);
CREATE TABLE IF NOT EXISTS messages (
  id TEXT NOT NULL,
  business_id TEXT NOT NULL,
  jid TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  from_me INTEGER NOT NULL,
  sender_name TEXT,
  type TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  media_path TEXT,
  timestamp INTEGER NOT NULL,
  status TEXT,
  PRIMARY KEY (business_id, id)
);
CREATE INDEX IF NOT EXISTS messages_chat_idx
  ON messages (business_id, jid, timestamp DESC);
CREATE INDEX IF NOT EXISTS contacts_recent_idx
  ON contacts (business_id, last_message_at DESC);
`

let database: DatabaseSync | null = null

export function getDatabase(): DatabaseSync {
  if (database) return database

  const directory = join(app.getPath('userData'), 'messaging')
  mkdirSync(directory, { recursive: true })
  database = new DatabaseSync(join(directory, 'messages.db'))
  database.exec(schema)
  migrateColumns(database)
  return database
}

function migrateColumns(db: DatabaseSync): void {
  for (const table of ['contacts', 'messages']) {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all() as unknown as Array<{ name: string }>
    if (!columns.some((column) => column.name === 'channel')) db.exec(`ALTER TABLE ${table} ADD COLUMN channel TEXT NOT NULL DEFAULT 'whatsapp'`)
  }
}

export function closeDatabase(): void {
  database?.close()
  database = null
}
