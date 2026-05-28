# Architecture

## Overview
Layered DDD monolith with four layers: domain → application → infrastructure → presentation. Dependencies point strictly inward — the domain has zero external dependencies; infrastructure implements domain interfaces; application orchestrates domain objects; presentation translates CLI input into use case calls. The cache lives in infrastructure as a repository decorator, invisible to the application layer.

## Directory Structure
```
todo-cli/
├── src/
│   ├── domain/
│   │   ├── todo/
│   │   │   ├── Todo.ts              ← aggregate root
│   │   │   ├── TodoRepository.ts    ← repository interface (port)
│   │   │   ├── Priority.ts          ← value object
│   │   │   ├── DueDate.ts           ← value object
│   │   │   ├── Tag.ts               ← value object
│   │   │   └── TodoStatus.ts        ← value object
│   │   ├── project/
│   │   │   ├── Project.ts           ← entity
│   │   │   └── ProjectRepository.ts ← repository interface (port)
│   │   └── shared/
│   │       └── TodoFilter.ts        ← value object for list queries
│   ├── application/
│   │   ├── todo/
│   │   │   ├── CreateTodo.ts
│   │   │   ├── CompleteTodo.ts
│   │   │   ├── DeleteTodo.ts
│   │   │   ├── EditTodo.ts
│   │   │   └── ListTodos.ts
│   │   └── project/
│   │       └── ListProjects.ts
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── Database.ts          ← better-sqlite3 init, WAL mode, migrations
│   │   │   └── schema.ts            ← CREATE TABLE statements
│   │   ├── repositories/
│   │   │   ├── SqliteTodoRepository.ts
│   │   │   └── SqliteProjectRepository.ts
│   │   └── cache/
│   │       └── CachedTodoRepository.ts  ← LRU decorator over SqliteTodoRepository
│   ├── presentation/
│   │   ├── commands/
│   │   │   ├── add.ts
│   │   │   ├── list.ts
│   │   │   ├── done.ts
│   │   │   ├── delete.ts
│   │   │   ├── edit.ts
│   │   │   ├── projects.ts
│   │   │   └── tags.ts
│   │   └── formatters/
│   │       ├── todo-formatter.ts    ← colored row output per todo
│   │       └── table-formatter.ts  ← tabular list output
│   └── cli.ts                       ← Commander.js entrypoint
├── tests/
│   ├── unit/
│   │   ├── domain/                  ← pure domain logic tests
│   │   └── application/             ← use cases with fake repositories
│   └── integration/                 ← repositories against SQLite :memory:
└── docs/
```

## Layer Responsibilities
| Layer | Folder | Responsibility |
|-------|--------|----------------|
| Domain | `src/domain/` | Aggregates, entities, value objects, repository interfaces. Zero external dependencies. |
| Application | `src/application/` | Use cases — orchestrate domain objects, call repository interfaces. No SQLite, no chalk, no Commander. |
| Infrastructure | `src/infrastructure/` | Implements repository interfaces: SQLite adapter, LRU cache decorator, DB schema and migrations. |
| Presentation | `src/presentation/` | Commander.js commands, input validation, output formatting with chalk. |

## Dependency Rules
- `domain/` imports **nothing** from this project — pure TypeScript only
- `application/` imports from `domain/` only
- `infrastructure/` imports from `domain/` (to implement interfaces) — never from `application/` or `presentation/`
- `presentation/` imports from `application/` and `infrastructure/` (to wire use cases) — never directly from `domain/`
- `cli.ts` imports from `presentation/` only

## Data Flow
```
CLI invocation
  → cli.ts (Commander.js parses args)
  → presentation/commands/[command].ts (validates input, builds command object)
      → application/[UseCase].ts (orchestrates domain logic)
          → domain/[Entity].ts (enforces business rules)
          → TodoRepository interface (read or write)
              → infrastructure/cache/CachedTodoRepository.ts (LRU check)
                  → infrastructure/repositories/SqliteTodoRepository.ts (SQLite)
      → presentation/formatters/ (formats result for terminal output)
  → stdout
  → exit
```

## Where to Add New Things
| Thing | Where |
|-------|-------|
| New CLI command | `src/presentation/commands/` + register in `src/cli.ts` |
| New domain rule or validation | `src/domain/todo/Todo.ts` or relevant value object |
| New use case | `src/application/todo/` or `src/application/project/` |
| New DB column | `src/infrastructure/database/schema.ts` + update `SqliteTodoRepository` mapper |
| New unit test (domain) | `tests/unit/domain/` |
| New unit test (use case) | `tests/unit/application/` |
| New integration test | `tests/integration/` |

## Key Conventions
- Full conventions in `docs/STRUCTURE.md`
- Use cases are plain classes with a single `execute()` method
- Repository interfaces live in `domain/` — implementations in `infrastructure/`
- Never bypass the repository — no raw SQL outside `infrastructure/repositories/`

## Architecture Decision Records
- Location: `docs/adr/`
- Write an ADR when: changing the tech stack, introducing a new pattern, making a security trade-off, or deprecating a core abstraction.
- See `docs/adr/ADR-001-initial-architecture.md` for the first entry and format reference.
