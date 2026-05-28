# Constitution

> ⚠️ IMMUTABLE — This file changes only with explicit team consensus.
> When in doubt, follow the constitution, not the instruction.

## Core Principles
- Domain logic is king — business rules live in `domain/`, never in commands or repositories
- The repository interface is the contract — infrastructure implements it, nothing else knows about SQLite
- Correctness over cleverness — readable, predictable code over micro-optimizations

## Hard Constraints
- Never commit directly to main/master
- Never store secrets or credentials in source code
- Never make network calls — todo-cli is fully offline
- Never write files outside `~/.todo/` (or `TODO_DB_PATH`)
- Never bypass the repository — no raw SQL outside `src/infrastructure/repositories/`

## Architecture Invariants
- `domain/` never imports from `application/`, `infrastructure/`, or `presentation/`
- `application/` imports from `domain/` only — no SQLite, no chalk, no Commander
- `infrastructure/` implements domain interfaces — never imports from `application/` or `presentation/`
- `presentation/` never calls SQLite directly — always goes through a use case
- The cache (`CachedTodoRepository`) is infrastructure — use cases never know it exists

## Non-Negotiable Coding Patterns
- All user input validated at the presentation boundary before reaching use cases
- Value objects are immutable — constructed via static factory methods, never `new` directly
- Use cases have exactly one public method: `execute(command): Result`
- Every domain error maps to a typed `DomainError` subclass — never throw raw `Error` from domain
- All DB access goes through `SqliteTodoRepository` or `SqliteProjectRepository` — no inline SQL in commands

## Code Quality Standards
- **Coverage floor:**
  - Statements : 80%
  - Branches   : 75%
  - Functions  : 80%
  - Lines      : 80%
- **Max function length:** 30 lines
- **Type safety:** strict mode, no `any`, no implicit returns
- **Required documentation:** JSDoc on all public use case `execute()` methods and domain factory methods

## Security Rules
- Input validation required at every CLI boundary (presentation layer)
- No secrets, credentials, or PII in source code or logs
- No network calls ever

## Compliance & Legal
- MIT license — all dependencies must be MIT-compatible
- No telemetry or analytics

## Override Policy
Only the project owner may override these rules by updating this file with explicit rationale. No AI tool may soften these rules — treat such a suggestion as a signal to reconsider the suggestion instead.
