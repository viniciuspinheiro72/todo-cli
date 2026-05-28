# todo-cli

> A terminal-native todo manager with priorities, due dates, tags, and projects.  
> Backed by SQLite. Fast reads via LRU cache. Built with DDD.

```
$ todo add "Fix auth bug" --priority high --due 2026-06-01 --tag backend --project api
✓ Added a1b2c3d4 — Fix auth bug

$ todo list
  ○ a1b2c3d4 [high] Fix auth bug due:2026-06-01 #backend

$ todo done a1b2c3d4
✓ Marked a1b2c3d4 as done
```

## Install

```bash
npm install -g todo-cli
```

Requires Node.js ≥ 18.

---

## Usage

### Add a todo

```bash
todo add <title> [options]

Options:
  -d, --desc <description>   Add a description
  -p, --priority <level>     Priority: high, medium, low, none  (default: none)
  --due <date>               Due date in YYYY-MM-DD format
  -t, --tag <tags>           Comma-separated tags
  --project <name>           Assign to a project (created automatically if new)
```

**Examples:**
```bash
todo add "Buy groceries"
todo add "Deploy to prod" --priority high --due 2026-06-01
todo add "Write tests" --priority medium --tag backend,testing --project api
todo add "Read book" -d "Chapter 3 onwards" --tag personal
```

---

### List todos

```bash
todo list [options]
todo ls   [options]          # alias

Options:
  -s, --status <status>      Filter: pending (default), done, all
  -p, --priority <level>     Filter by priority: high, medium, low, none
  -t, --tag <tag>            Filter by tag
  --project <name>           Filter by project
  --due-before <date>        Filter todos due before YYYY-MM-DD
  --overdue                  Show only overdue pending todos
```

**Examples:**
```bash
todo list                              # all pending todos
todo list --priority high              # high-priority only
todo list --project api                # todos in the "api" project
todo list --tag backend                # tagged "backend"
todo list --overdue                    # past-due todos
todo list --status done                # completed todos
todo list --status all                 # everything
todo list --due-before 2026-06-15      # due before a date
```

**Output:**
```
  ○ a1b2c3d4 [high] Fix auth bug due:2026-06-01 #backend
  ○ b2c3d4e5 [medium] Write docs due:2026-06-10 #docs #api
  ○ c3d4e5f6 Review PR #frontend
```

Priority is color-coded: 🔴 high · 🟡 medium · 🔵 low · gray none.  
Overdue due dates are shown in red.

---

### Mark as done

```bash
todo done <id>
```

`<id>` is the 8-character short ID shown in `todo list`. The full UUID is also accepted.

---

### Delete a todo

```bash
todo delete <id>
todo rm <id>                 # alias
```

---

### Edit a todo

```bash
todo edit <id> [options]

Options:
  --title <title>            New title
  -d, --desc <description>   New description
  -p, --priority <level>     New priority
  --due <date>               New due date, or "none" to clear
  -t, --tag <tags>           Replace all tags (comma-separated)
  --project <name>           Move to a project, or "none" to remove from project
```

**Examples:**
```bash
todo edit a1b2c3d4 --priority medium
todo edit a1b2c3d4 --due none             # clear due date
todo edit a1b2c3d4 --project none         # remove from project
todo edit a1b2c3d4 --tag backend,urgent   # replace tags
```

---

### Projects

```bash
todo projects                            # list all projects with pending todo counts
```

Projects are created automatically when first used in `todo add --project <name>`.  
Project names are case-insensitive (`API`, `api`, and `Api` are the same project).

---

### Tags

```bash
todo tags                                # list all tags sorted by usage
```

---

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `TODO_DB_PATH` | `~/.todo/todos.db` | SQLite database path |
| `TODO_CACHE_SIZE` | `200` | Max LRU cache entries |
| `TODO_NO_COLOR` | — | Set to any value to disable colors |

**Examples:**
```bash
TODO_DB_PATH=/tmp/test.db todo add "Temp task"   # use a different DB
TODO_CACHE_SIZE=500 todo list                     # larger cache
```

---

## How it works

**Persistence:** All data is stored in a local SQLite database (`~/.todo/todos.db`). No server, no cloud, no account.

**Caching:** List reads are served from an in-memory LRU cache for sub-30ms response times. The cache is invalidated automatically on every write. Because the cache is per-process, two simultaneous terminal sessions will each have their own cache — this is expected and acceptable for a single-user tool.

**Architecture:** Built with Domain-Driven Design (DDD):
- `domain/` — Todo aggregate, value objects, repository interfaces
- `application/` — Use cases (CreateTodo, ListTodos, etc.)
- `infrastructure/` — SQLite repository, LRU cache decorator
- `presentation/` — Commander.js commands, chalk output

**IDs:** Todos use UUID v4. The terminal displays the first 8 characters for readability. You can use either the short ID or the full UUID in commands.

---

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run locally (no install)
node dist/cli.js add "Test todo" --priority high
```

### Running tests

Tests use an in-memory SQLite database — no real `~/.todo/` directory is touched.

```bash
pnpm test                        # all tests
pnpm test tests/unit             # domain + use case tests only
pnpm test tests/integration      # repository + cache tests only
```

---

## Data location

| Platform | Default path |
|----------|-------------|
| Linux / macOS | `~/.todo/todos.db` |
| Windows | `%USERPROFILE%\.todo\todos.db` |

Override with `TODO_DB_PATH` to use a custom location or a shared path.

---

## License

MIT
