# Testing Strategy

## Testing Philosophy
Test behavior, not implementation. Domain logic tested in pure unit tests with no dependencies. Use cases tested with in-memory repository fakes (not mocks). Infrastructure tested against a real SQLite in-memory database — never mock the database layer.

## Scope
### In Scope
- Domain entity creation and validation rules
- All use case behaviors (happy path + error cases)
- Repository implementations against in-memory SQLite
- Cache invalidation correctness
- CLI command output format (via stdout capture)

### Out of Scope
- Commander.js internals
- chalk/color rendering
- File system edge cases (permissions, disk full)

## Test Types & Tools
| Type        | Tool | Notes |
|-------------|------|-------|
| Unit        | Vitest | Domain entities, value objects, pure functions |
| Integration | Vitest | Use cases with fake repositories; SQLite repo with `:memory:` db |
| E2E         | — | Not needed — commands are the boundary |

## Entry Criteria
- TypeScript compiles without errors
- All dependencies installed

## Exit Criteria
- All tests pass
- Coverage floors met (see CONSTITUTION.md)
- No test touches real `~/.todo/` directory

## Test Environment
| Environment | Purpose | DB | External APIs |
|-------------|---------|-----|---------------|
| local | Development | SQLite `:memory:` | N/A |
| CI | Validation | SQLite `:memory:` | N/A |

## Unit Test Patterns
- Test domain entities directly — no use case or repository involved
- Fake repositories implement domain interfaces with in-memory Maps
- Never mock the cache — test it as a black box via observable behavior (response time or call count)

## Integration Test Scope
- Use cases tested with `InMemoryTodoRepository` fake
- `SqliteTodoRepository` tested against `new Database(':memory:')` — real SQL, in-memory file
- `CachedTodoRepository` tested by verifying the underlying repo is called only once on repeated reads

## E2E Scenarios (Critical Paths)
- Add todo → appears in `list`
- Complete todo → disappears from default `list`, appears in `--status done`
- Filter by tag → only tagged todos shown
- Cache invalidation → after edit, list returns updated data

## Risks & Mitigations
| Risk | Mitigation |
|------|-----------|
| Tests touching real `~/.todo/` | Always set `TODO_DB_PATH=:memory:` or temp file in test env |
| Cache state leaking between tests | Create new `CachedTodoRepository` instance per test |

## CI/CD Integration
Tests run on every push. Blocking — CI fails on test failure or coverage below floor.

## How to Run Tests Locally
```bash
# Run all tests:
pnpm test

# Run unit tests only:
pnpm test tests/unit

# Run with coverage report:
pnpm test --coverage
```
