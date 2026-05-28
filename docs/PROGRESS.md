# Progress

## Done
- [x] 2026-05-28 — Full project documentation initialized (init-docs)

## In Progress
- [ ] Nothing yet

## Blocked
| Item | Blocker | Who can unblock |
|------|---------|-----------------|
| — | — | — |

## Next
- [ ] Project scaffold (package.json, tsconfig, vitest, gitignore)
- [ ] Domain layer — Todo aggregate, value objects, repository interfaces
- [ ] Infrastructure — DB setup, SqliteTodoRepository, SqliteProjectRepository
- [ ] Cache — CachedTodoRepository (LRU decorator)
- [ ] Application — all use cases
- [ ] Presentation — all commands + formatters
- [ ] Unit tests — domain + use cases
- [ ] Integration tests — SQLite repos + cache
- [ ] GitHub repo + publish to npm

## Icebox
- Shell completion (zsh/bash)
- `todo archive` — move done todos to archive table
- `todo import` / `todo export` (JSON)
- `todo list --today` / `todo list --overdue`
