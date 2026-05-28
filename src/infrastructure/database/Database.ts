import { createRequire } from 'module'
import { mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import { SCHEMA } from './schema.js'
import type { DatabaseSync as DatabaseSyncType } from 'node:sqlite'

// Load node:sqlite via require to bypass Vite's static module analyzer,
// which doesn't recognize node:sqlite as a built-in (added in Node.js 22.5).
const require = createRequire(import.meta.url)
const { DatabaseSync } = require('node:sqlite') as { DatabaseSync: typeof DatabaseSyncType }

export type DB = InstanceType<typeof DatabaseSyncType>

export function getDbPath(): string {
  if (process.env.TODO_DB_PATH) return process.env.TODO_DB_PATH
  const dir = join(homedir(), '.todo')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return join(dir, 'todos.db')
}

export function openDatabase(path?: string): InstanceType<typeof DatabaseSyncType> {
  const db = new DatabaseSync(path ?? getDbPath())
  db.exec(SCHEMA)
  return db
}
