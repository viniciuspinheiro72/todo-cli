# Pitfalls & Known Gotchas

## better-sqlite3 requires native compilation
- **What happens:** `pnpm install` fails with node-gyp errors on some systems
- **Why it happens:** better-sqlite3 is a native Node.js addon that must be compiled for the target platform and Node.js version
- **How to avoid:** Pin Node.js to ≥18 LTS. Document in README. Provide `engines` field in package.json. If using nvm, run `nvm use` before install.
- **Discovered:** Design phase — known better-sqlite3 constraint

## LRU cache is per-process — two concurrent CLIs see stale data
- **What happens:** Running `todo add` in one terminal and `todo list` in another immediately after may show the old list
- **Why it happens:** Each CLI invocation is a separate process with its own cache instance
- **How to avoid:** This is by design and acceptable for a single-user tool. Document in README. Do not attempt cross-process cache invalidation.
- **Discovered:** Design phase — architectural decision

## Short ID ambiguity
- **What happens:** `todo done abc1` could match multiple todos if the DB grows large
- **Why it happens:** Short IDs are the first 8 chars of UUID — collisions are extremely rare but theoretically possible
- **How to avoid:** Always validate uniqueness before acting. If ambiguous, prompt user to provide the full UUID.
- **Discovered:** Design phase

## SQLite WAL mode must be enabled explicitly
- **What happens:** Default SQLite journal mode causes write locks that slow down concurrent reads
- **Why it happens:** SQLite defaults to DELETE journal mode
- **How to avoid:** Run `PRAGMA journal_mode=WAL` on database initialization. Already implemented in `SqliteDatabase` setup.
- **Discovered:** Design phase — SQLite best practice
