# Codebase Structure & Conventions

## File Naming
- **Source files:** `PascalCase.ts` for classes/interfaces (e.g. `Todo.ts`, `CreateTodo.ts`), `kebab-case.ts` for utilities and formatters (e.g. `todo-formatter.ts`)
- **Test files:** `*.test.ts` centralized under `tests/unit/` or `tests/integration/`
- **Config files:** `*.config.ts` at root (e.g. `vitest.config.ts`)
- **Schema / migrations:** `schema.ts` in `src/infrastructure/database/`

## Folder Organization
- **Domain layer:** one subfolder per aggregate root (`todo/`, `project/`, `shared/`)
- **Application layer:** one subfolder per aggregate (`todo/`, `project/`), one file per use case
- **Infrastructure layer:** split by concern (`database/`, `repositories/`, `cache/`)
- **Presentation layer:** `commands/` (one file per command) + `formatters/`

```
src/
├── domain/
│   ├── todo/           ← Todo aggregate — entity + value objects + repo interface
│   ├── project/        ← Project entity + repo interface
│   └── shared/         ← Cross-aggregate value objects (TodoFilter)
├── application/
│   ├── todo/           ← One file per use case: CreateTodo.ts, ListTodos.ts…
│   └── project/
├── infrastructure/
│   ├── database/       ← DB init, schema, WAL setup
│   ├── repositories/   ← SqliteTodoRepository, SqliteProjectRepository
│   └── cache/          ← CachedTodoRepository (LRU decorator)
└── presentation/
    ├── commands/        ← add.ts, list.ts, done.ts, delete.ts, edit.ts…
    └── formatters/      ← todo-formatter.ts, table-formatter.ts
```

## Import Conventions
- **Absolute vs relative:** relative imports only (no path aliases)
- **Import order:** Node built-ins → external packages → internal modules (relative)
- **Barrel exports:** one `index.ts` per domain subdirectory only — exports the aggregate, value objects, and repository interface as a group. No barrels in application or infrastructure.
- **Example:**
  ```ts
  import { randomUUID } from 'crypto'              // Node built-in
  import Database from 'better-sqlite3'            // external
  import type { TodoRepository } from '../../domain/todo/index.js' // internal
  ```

## Naming Conventions
- **Classes / interfaces / types:** `PascalCase` (e.g. `Todo`, `TodoRepository`, `CreateTodoCommand`)
- **Variables / functions / methods:** `camelCase`
- **Constants:** `SCREAMING_SNAKE_CASE` (e.g. `DEFAULT_PRIORITY`)
- **Database tables:** `snake_case` plural (e.g. `todos`, `projects`, `todo_tags`)
- **Database columns:** `snake_case` (e.g. `due_date`, `project_id`, `created_at`)
- **Environment variables:** `SCREAMING_SNAKE_CASE` with `TODO_` prefix
- **Use case classes:** verb + noun (e.g. `CreateTodo`, `ListTodos`, `CompleteTodo`)
- **Value objects:** noun only (e.g. `Priority`, `DueDate`, `Tag`)

## Code Style
**Use cases follow a consistent pattern — one `execute()` method, typed command/result:**
```ts
export class CreateTodo {
  constructor(private readonly todoRepository: TodoRepository) {}

  execute(command: CreateTodoCommand): Todo {
    const todo = Todo.create({
      title: command.title,
      priority: Priority.from(command.priority ?? 'none'),
      tags: (command.tags ?? []).map(Tag.from),
    })
    this.todoRepository.save(todo)
    return todo
  }
}
```

**Value objects are immutable and validate on construction:**
```ts
export class Priority {
  private constructor(readonly value: PriorityLevel) {}

  static from(raw: string): Priority {
    if (!VALID_PRIORITIES.includes(raw as PriorityLevel))
      throw new DomainError(`Invalid priority: ${raw}`)
    return new Priority(raw as PriorityLevel)
  }
}
```

## Co-location Rules
- **Tests:** centralized — `tests/unit/domain/`, `tests/unit/application/`, `tests/integration/`
- **Types:** co-located with their class — `Todo.ts` exports both the `Todo` class and the `TodoProps` interface
- **No CSS** — CLI project

## What NOT to Do
- Never import from `infrastructure/` in `domain/` or `application/`
- Never write raw SQL outside `src/infrastructure/repositories/`
- Never call `chalk` or `console.log` in `domain/` or `application/`
- Never call `process.exit()` in domain, application, or infrastructure — throw typed errors, let `cli.ts` handle exit codes
- Never use `any` — strict TypeScript enforced
- Never bypass the repository with direct DB access from commands
