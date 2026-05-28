# Decision Log

### 2026-05-28 — Tags stored in normalized join table, not JSON column
- **Decision:** `todo_tags` is a separate table with `(todo_id, tag)` composite primary key
- **Why:** Enables efficient `SELECT todos WHERE tag = ?` without JSON parsing; supports cascaded delete; consistent with relational model
- **Alternatives considered:** JSON column (simpler schema, harder to query); array column (PostgreSQL-only feature)
- **Consequences:** Slightly more complex repository mapping; tag insertion requires two statements (todo insert + tag inserts)

### 2026-05-28 — Project names stored lowercase, matched case-insensitively
- **Decision:** Project names normalized to lowercase on creation and lookup
- **Why:** Prevents duplicate projects (`API` vs `api` vs `Api`); consistent display
- **Alternatives considered:** Case-sensitive storage (more flexibility, more footguns)
- **Consequences:** `--project API` and `--project api` are equivalent

### 2026-05-28 — Short IDs are first 8 chars of UUID (display only)
- **Decision:** Full UUID stored in DB; CLI displays and accepts 8-char prefix
- **Why:** UUIDs are unreadable in terminal output; 8 chars is collision-resistant for personal todo lists
- **Alternatives considered:** Auto-increment integers (simpler but not portable across DB snapshots)
- **Consequences:** Must validate uniqueness when resolving short IDs; user can always provide full UUID
