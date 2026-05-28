# Technical Design Document

## Tech Stack
| Layer          | Technology      | Version | Reason for Choice |
|----------------|----------------|---------|-------------------|
| Language       | TypeScript     | 5.x     | Type safety, DDD interfaces, strict mode |
| CLI framework  | Commander.js   | 12.x    | Industry standard, minimal, composable |
| Database       | better-sqlite3 | 9.x     | Synchronous SQLite — fits CLI model perfectly |
| Cache          | lru-cache      | 10.x    | Well-tested LRU implementation, zero deps |
| Output         | chalk          | 5.x     | Terminal colors for priority display |
| Date handling  | date-fns       | 3.x     | Lightweight, tree-shakeable, no Moment.js bloat |
| ID generation  | uuid           | 9.x     | Standard UUID v4 for todo IDs |
| Testing        | Vitest         | 1.x     | Native ESM, fast, compatible with pnpm |
| Package mgr    | pnpm           | 9.x     | Fast, disk-efficient |
| Runtime        | Node.js        | ≥18     | LTS, required by better-sqlite3 v9 |

> Stack summary (no rationale) repeated in `AGENTS.md`.
> When the stack changes, update both files.

## Goals
- Sub-30ms `todo list` response on cache hit
- Zero runtime network calls — fully offline
- DDD layering enforced: domain never imports from infrastructure
- Repository pattern with interface-based contracts for testability

## Non-Goals
- GUI, web interface, or TUI
- Cloud sync, collaboration, or multi-user
- Recurring tasks, reminders, or time tracking
- Real-time updates between concurrent CLI processes

## Architecture Overview
Layered DDD monolith: domain → application → infrastructure → presentation. Each layer imports only from the layer beneath it. Infrastructure implements domain repository interfaces. The cache is a decorator over the SQLite repository.

## Directory Structure
See `docs/ARCHITECTURE.md` for full folder map.

## MCP Servers
| Server | Purpose | Config File | Notes |
|--------|---------|-------------|-------|
| — | No MCP servers | — | Local CLI tool |

## Environment Variables
| Variable | Purpose | Required |
|----------|---------|----------|
| TODO_DB_PATH | Override default `~/.todo/todos.db` path | No |
| TODO_NO_COLOR | Disable chalk colors in output | No |
| TODO_CACHE_SIZE | Max LRU cache entries (default: 200) | No |

## Database Schema

```sql
CREATE TABLE projects (
  id   TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,   -- stored lowercase
  created_at TEXT NOT NULL
);

CREATE TABLE todos (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  priority    TEXT NOT NULL DEFAULT 'none',  -- high | medium | low | none
  due_date    TEXT,                          -- ISO 8601 date string YYYY-MM-DD
  status      TEXT NOT NULL DEFAULT 'pending', -- pending | done
  project_id  TEXT REFERENCES projects(id),
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE TABLE todo_tags (
  todo_id TEXT NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  tag     TEXT NOT NULL,
  PRIMARY KEY (todo_id, tag)
);

CREATE INDEX idx_todos_status   ON todos(status);
CREATE INDEX idx_todos_priority ON todos(priority);
CREATE INDEX idx_todos_due_date ON todos(due_date);
CREATE INDEX idx_todos_project  ON todos(project_id);
```

## Component Architecture
| Layer | Module | Responsibility |
|-------|--------|----------------|
| Domain | `Todo`, `Project` | Aggregates, value objects, repository interfaces |
| Application | `CreateTodo`, `ListTodos`, `CompleteTodo`, etc. | Use cases, orchestration |
| Infrastructure | `SqliteTodoRepository`, `CachedTodoRepository` | DB access, cache decorator |
| Presentation | `src/commands/` | Commander.js commands, output formatting |

## Error Handling Strategy
- **Error classification:** `DomainError` (invalid input, business rule) / `InfrastructureError` (DB failure) / `NotFoundError` (ID not found)
- **Client-facing errors:** plain English to stderr, non-zero exit code
- **Logging:** nothing logged — CLI stdout/stderr only; no PII
- **Alerting:** N/A — local tool

## Security Considerations
- **Authentication:** N/A
- **Authorization:** N/A — user's own files only
- **Data at rest:** SQLite file in user home dir — no encryption needed
- **Data in transit:** no network calls
- **Sensitive data handling:** no sensitive data collected

## Performance Considerations
- **SLA targets:** < 30ms list (cache hit), < 100ms list (cache miss / cold start)
- **Caching strategy:** LRU cache keyed by filter hash. Cache invalidated on any write (create, update, delete). Cache size configurable via `TODO_CACHE_SIZE`.
- **Known bottlenecks:** SQLite full table scan on unindexed columns — mitigated by indexes on status, priority, due_date, project_id
- **Scaling approach:** N/A — single user, local data

## Key Technical Decisions & Rationale
- **Synchronous SQLite (better-sqlite3):** CLI is single-process; async adds no benefit and complicates code significantly
- **LRU cache as repository decorator:** keeps cache logic out of both domain and SQLite repo; swappable without changing use cases
- **Tags as normalized table:** enables efficient `SELECT * WHERE tag = ?` without JSON parsing overhead
- **Short IDs (first 8 chars):** full UUID stored; display uses 8 chars for usability; full UUID accepted on input for disambiguation

## Known Technical Debt
- Tags are stored lowercase but no unicode normalization — emojis in tag names are technically allowed
