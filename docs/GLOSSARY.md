# Domain Glossary

## Todo
- **Definition:** The aggregate root of the system. A single actionable task with a title, optional description, priority, optional due date, status, optional project, and zero or more tags.
- **NOT:** A generic "task" or "item" — always called Todo in code and docs.
- **Synonyms to avoid:** "task", "item", "entry", "record" — use "Todo" only.
- **Bounded context:** Task Management (the only bounded context in this project).
- **Code name:** `Todo` (class/interface); `todos` (DB table); `todo` (variable).
- **Related terms:** Priority, DueDate, Tag, TodoStatus, Project.
- **Example:** "The user creates a Todo with title 'Fix auth bug', priority High, and tag 'backend'."

---

## Project
- **Definition:** An entity that groups related Todos under a named label. A Todo belongs to at most one Project. Projects are created implicitly when first referenced in `todo add --project <name>`.
- **NOT:** A folder, workspace, or category — Project is a named grouping only, with no hierarchy.
- **Synonyms to avoid:** "workspace", "folder", "category", "group".
- **Bounded context:** Task Management.
- **Code name:** `Project` (class/interface); `projects` (DB table); `project` (variable); `project_id` (FK column).
- **Related terms:** Todo.
- **Example:** "The 'api' Project contains all Todos tagged for the backend API work."

---

## Priority
- **Definition:** A value object expressing the urgency of a Todo. Four levels: `high`, `medium`, `low`, `none`. `none` is the default — it means no priority has been assigned, not that the Todo is unimportant.
- **NOT:** An integer or numeric rank — Priority is always a named level.
- **Synonyms to avoid:** "urgency", "importance", "rank", "level".
- **Bounded context:** Task Management.
- **Code name:** `Priority` (TypeScript union type or enum); `priority` (DB column, CLI flag).
- **Related terms:** Todo.
- **Example:** "A Todo with Priority `high` is sorted before `medium` in the default list output."

---

## DueDate
- **Definition:** A value object wrapping an optional calendar date by which a Todo should be completed. Stored as an ISO 8601 date string (`YYYY-MM-DD`). A Todo without a DueDate is not "overdue" — it simply has no deadline.
- **NOT:** A datetime or timestamp — DueDate is date-only, no time component.
- **Synonyms to avoid:** "deadline", "expiry", "target date" — use "due date" in user-facing text and `DueDate` in code.
- **Bounded context:** Task Management.
- **Code name:** `DueDate` (value object class); `due_date` (DB column); `--due` (CLI flag).
- **Related terms:** Todo.
- **Example:** "A Todo with DueDate `2026-06-01` appears in `todo list --overdue` if today is after 2026-06-01 and status is pending."

---

## Tag
- **Definition:** A value object representing a single label attached to a Todo. Tags are lowercase, alphanumeric strings (hyphens allowed). A Todo can have zero or more Tags. Tags are stored in a normalized join table.
- **NOT:** A category or project — Tags are lightweight, flat labels with no hierarchy.
- **Synonyms to avoid:** "label", "keyword", "category".
- **Bounded context:** Task Management.
- **Code name:** `Tag` (value object); `todo_tags` (DB join table); `tag` (column); `--tag` (CLI flag, accepts comma-separated list).
- **Related terms:** Todo.
- **Example:** "A Todo tagged `backend,urgent` has two Tags: `backend` and `urgent`."

---

## TodoStatus
- **Definition:** A value object representing the lifecycle state of a Todo. Two values: `pending` (active, not yet done) and `done` (completed). There is no "archived" or "cancelled" state in v0.1.
- **NOT:** A boolean "completed" flag — TodoStatus is a named state to allow future extension.
- **Synonyms to avoid:** "completed", "active", "closed", "open" — use `pending` and `done` everywhere.
- **Bounded context:** Task Management.
- **Code name:** `TodoStatus` (TypeScript union `'pending' | 'done'`); `status` (DB column, CLI filter flag).
- **Related terms:** Todo.
- **Example:** "`todo done abc12345` transitions the Todo's TodoStatus from `pending` to `done`."

---

## TodoFilter
- **Definition:** A value object encapsulating all criteria for a `ListTodos` query: status, priority, tag, project name, due-before date, overdue flag. Passed from the presentation layer to the `ListTodos` use case. The use case hands it to the repository unchanged.
- **NOT:** A raw SQL WHERE clause or query string — the repository is responsible for translating a TodoFilter into SQL.
- **Bounded context:** Task Management.
- **Code name:** `TodoFilter` (interface); constructed in `src/commands/list.ts`, consumed by `ListTodos` use case and `TodoRepository.findAll()`.
- **Related terms:** Todo, TodoStatus, Priority, DueDate, Tag, Project.
- **Example:** "`todo list --priority high --tag backend --project api` produces a TodoFilter `{ priority: 'high', tag: 'backend', projectName: 'api' }`."

---

## TodoRepository
- **Definition:** The domain interface (port) that defines how Todos are persisted and retrieved. The domain layer depends on this interface, not on any concrete implementation. Two implementations exist: `SqliteTodoRepository` and `CachedTodoRepository` (decorator over Sqlite).
- **NOT:** The database itself, or a direct SQLite connection — TodoRepository is always the interface.
- **Bounded context:** Task Management.
- **Code name:** `TodoRepository` (TypeScript interface in `src/domain/`); implemented by `SqliteTodoRepository` and `CachedTodoRepository` in `src/infrastructure/`.
- **Related terms:** Todo, CachedTodoRepository, SqliteTodoRepository.
- **Example:** "The `CreateTodo` use case calls `this.todoRepository.save(todo)` — it never knows whether the underlying store is SQLite or an in-memory fake."

---

## CachedTodoRepository
- **Definition:** An infrastructure-layer decorator that wraps any `TodoRepository` implementation and adds an LRU cache for read operations. On any write (save or delete), it invalidates all cached entries. It is the outermost repository layer — use cases receive this, not the raw SQLite repo.
- **NOT:** A separate storage backend — it delegates all persistence to the wrapped repository.
- **Synonyms to avoid:** "cache", "cached repo" — always "CachedTodoRepository" in code.
- **Bounded context:** Task Management (Infrastructure layer).
- **Code name:** `CachedTodoRepository` (class in `src/infrastructure/cache/`).
- **Related terms:** TodoRepository, SqliteTodoRepository.
- **Example:** "A `todo list` call hits `CachedTodoRepository.findAll()`, returns from LRU cache if the key exists, otherwise delegates to `SqliteTodoRepository.findAll()` and caches the result."
