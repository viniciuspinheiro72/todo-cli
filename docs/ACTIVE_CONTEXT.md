# Active Context

## Current Focus
Project just initialized — ready to scaffold and implement the full DDD stack.

## In Progress
- Nothing yet — at initialization stage

## Blockers
- None

## Next Steps
1. Scaffold `package.json`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`
2. Implement `src/domain/` — Todo aggregate, value objects, repository interfaces
3. Implement `src/infrastructure/database/` — DB init, schema, WAL mode
4. Implement `src/infrastructure/repositories/` — SqliteTodoRepository, SqliteProjectRepository
5. Implement `src/infrastructure/cache/` — CachedTodoRepository
6. Implement `src/application/` — use cases
7. Implement `src/presentation/` — commands and formatters
8. Write unit and integration tests
9. Create GitHub repo and push

## Significant Decisions
- 2026-05-28 — DDD layered architecture chosen — see ADR-001
- 2026-05-28 — SQLite (better-sqlite3) + LRU cache decorator as persistence strategy
- 2026-05-28 — Tags stored in normalized `todo_tags` join table (not JSON column)

## Recent Context
- 2026-05-28 — Project initialized with init-docs. All documentation scaffolded.

## Open Questions
- Should `todo delete` require `--force` flag for safety?
- Should project names be case-insensitive at query time only, or stored lowercase?
