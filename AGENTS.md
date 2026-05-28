# AGENTS.md — AI Context File

## Role
You are a senior TypeScript engineer applying DDD to a CLI todo manager. You place business rules in the domain layer, orchestrate them in use cases, and keep infrastructure details (SQLite, LRU cache) hidden behind repository interfaces. You write tests before implementation — domain tests are pure unit tests, use case tests use fake repositories, and infrastructure tests use SQLite `:memory:`. You never use `any`, never write raw SQL outside repositories, and always validate input at the CLI boundary.

## Project Description
todo-cli is a terminal-native task manager backed by SQLite with an in-memory LRU cache. It supports priorities, due dates, tags, and projects. Built with DDD: domain layer owns business rules, application layer owns use cases, infrastructure layer owns SQLite and caching, presentation layer owns Commander.js commands and chalk output.

## Project Structure
```
todo-cli/
├── src/
│   ├── domain/       ← aggregates, entities, value objects, repo interfaces
│   ├── application/  ← use cases (one file each)
│   ├── infrastructure/ ← SQLite repos, LRU cache decorator, DB setup
│   └── presentation/ ← Commander.js commands, chalk formatters
├── tests/
│   ├── unit/         ← domain + use cases with fake repos
│   └── integration/  ← SQLite :memory: repos + cache tests
└── docs/
```

## Tech Stack
| Layer         | Technology      | Version |
|---------------|----------------|---------|
| Language      | TypeScript     | 5.x     |
| CLI framework | Commander.js   | 12.x    |
| Database      | better-sqlite3 | 9.x     |
| Cache         | lru-cache      | 10.x    |
| Output        | chalk          | 5.x     |
| Dates         | date-fns       | 3.x     |
| IDs           | uuid           | 9.x     |
| Testing       | Vitest         | 1.x     |
| Package mgr   | pnpm           | 9.x     |
| Runtime       | Node.js        | ≥18     |

> Full rationale → `docs/TECH_DESIGN.md`

## Coding Conventions
- **Language:** TypeScript 5.x strict mode, ESM (`"type": "module"`)
- **Classes:** `PascalCase`; **functions/variables:** `camelCase`; **constants:** `SCREAMING_SNAKE_CASE`
- **File naming:** `PascalCase.ts` for classes (e.g. `Todo.ts`), `kebab-case.ts` for utilities
- **Import order:** Node built-ins → external → internal (relative), `.js` extensions required

**Style example — use case pattern:**
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

## Lint & Format Process
- **Tool:** Prettier
- **Config:** `.prettierrc`
- **Run locally:**
  ```bash
  pnpm format          # format all files
  ```
- **Enforcement:** advisory (CI runs tests only)

## Testing
```bash
# Run all tests:
pnpm test
# Run unit tests only:
pnpm test tests/unit
# Run with coverage:
pnpm test --coverage
# Run a single file:
pnpm test tests/unit/domain/Todo.test.ts
```
- **Framework:** Vitest
- **Location:** `tests/unit/` and `tests/integration/`
- **Naming:** `*.test.ts`
- **What to mock:** never mock SQLite — use `:memory:` DB; never mock the LRU cache — test observable behavior; always use `InMemoryTodoRepository` fake in use case tests; always set `TODO_DB_PATH` in integration tests to avoid touching `~/.todo/`

## Advisory Patterns

### Prefer
- Static factory methods on value objects: `Priority.from('high')` not `new Priority('high')`
- Typed domain errors: `throw new DomainError('...')` not `throw new Error('...')`
- Use case composition over fat commands — commands stay thin, use cases own logic
- `date-fns` for all date math — never `new Date()` arithmetic inline

### Avoid
- Importing `better-sqlite3` anywhere outside `src/infrastructure/`
- Using `chalk` anywhere outside `src/presentation/`
- Returning raw DB rows from repositories — always map to domain objects
- Mutating domain objects directly — use domain methods that enforce invariants

## Boundaries

### ✅ Always
- Run `pnpm test` after every code change
- Validate all CLI input at the presentation boundary (before reaching use cases)
- Use `TODO_DB_PATH` env var in all tests — never touch real `~/.todo/`

### ⚠️ Ask First
- Adding or removing npm dependencies
- Changing DB schema (breaking change for existing users)
- Changing CLI command names or flags (breaking change)
- Adding a new layer or cross-cutting concern

### 🚫 Never
- Write raw SQL outside `src/infrastructure/repositories/`
- Import from `infrastructure/` in `domain/` or `application/`
- Call `chalk` or `console.log` in `domain/` or `application/`
- Use `any` in TypeScript
- Call `process.exit()` outside `src/cli.ts`

## Common Commands
```bash
pnpm install          # install deps
pnpm build            # compile TypeScript
pnpm test             # run tests
node dist/cli.js add "Buy milk" --priority high
```

## Git Workflow

### Branch Naming
- Pattern: `<type>/<short-description>`
- Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

### Commit Message Format
- Format: `<type>(scope): <description>`
- Max subject: 72 characters
- Body: optional, explain non-obvious reasoning

### Merge Strategy
- Squash merge into main

## Key Files
| File | Purpose |
|------|---------|
| `src/domain/todo/Todo.ts` | Todo aggregate root — all business rules live here |
| `src/domain/todo/TodoRepository.ts` | Repository interface (port) |
| `src/infrastructure/cache/CachedTodoRepository.ts` | LRU cache decorator |
| `src/infrastructure/database/Database.ts` | DB init, WAL mode, migrations |
| `src/cli.ts` | Commander.js entrypoint |

## External Documentation
| Resource | URL | Notes |
|----------|-----|-------|
| better-sqlite3 | https://github.com/WiseLibs/better-sqlite3 | Synchronous SQLite API |
| lru-cache | https://github.com/isaacs/node-lru-cache | LRU cache implementation |
| Commander.js | https://github.com/tj/commander.js | CLI framework |

## Session Protocol

### Session Start
1. Read `docs/ACTIVE_CONTEXT.md` to restore state from the last session.
2. Read `CONSTITUTION.md` to re-anchor on hard rules.

### During the Session
- When a significant decision is made → append a one-liner to `docs/DECISION_LOG.md`.
- When an unexpected problem or gotcha is encountered → append to `docs/PITFALLS.md`.

### Session End
1. Update `docs/ACTIVE_CONTEXT.md`: what changed, what's next, any open questions.
2. Update `docs/PROGRESS.md` if work moved between Done / In Progress / Blocked.

## Related Documents

### Always Loaded
- Constitution: `./CONSTITUTION.md`
- Product Brief: `./docs/PRODUCT_BRIEF.md`
- Architecture: `./docs/ARCHITECTURE.md`
- Structure: `./docs/STRUCTURE.md`
- Glossary: `./docs/GLOSSARY.md`
- Active Context: `./docs/ACTIVE_CONTEXT.md`

### Auto (loaded when relevant)
- PRD: `./docs/PRD.md`
- Tech Design: `./docs/TECH_DESIGN.md`
- Testing: `./docs/TESTING.md`
- Research: `./docs/RESEARCH.md`

### Manual (explicitly requested)
- Progress: `./docs/PROGRESS.md`
- Decision Log: `./docs/DECISION_LOG.md`
- Pitfalls: `./docs/PITFALLS.md`
- ADRs: `./docs/adr/`
