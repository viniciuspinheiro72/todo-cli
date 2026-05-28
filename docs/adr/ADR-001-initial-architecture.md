---
status: Accepted
date: 2026-05-28
decision-makers: Solo developer
consulted: —
informed: —
---

# ADR-001: DDD Layered Architecture with SQLite + LRU Cache

## Context and Problem Statement
todo-cli needs to manage todos with rich attributes (priority, due date, tags, project) in a way that is testable, extensible, and maintainable. The key architectural questions are: how to structure the code, how to persist data, and how to make reads fast without running a daemon.

## Decision Drivers
- Must be testable at all layers without a running database
- Domain logic must be isolated from persistence concerns
- Must be installable via `npm install -g todo-cli` with minimal setup friction
- Sub-30ms response time for `todo list` on cache hit
- Single developer — no coordination overhead needed

## Considered Options
- **Option A:** DDD layered architecture with SQLite (better-sqlite3) + LRU cache decorator
- **Option B:** Simple flat architecture — single file per command, direct SQLite calls
- **Option C:** JSON file storage (same as pomo-cli pattern)

## Decision Outcome
Chosen: **Option A — DDD layered architecture with SQLite + LRU cache** because it provides testability through repository interfaces, keeps domain logic pure, and enables fast reads through the cache decorator without polluting use cases with caching concerns.

### Consequences
- **Positive:** Domain logic fully unit-testable without DB; cache logic encapsulated in one class; use cases don't know whether data comes from cache or disk
- **Negative:** More boilerplate than a flat architecture; new contributors need to understand DDD layering
- **Neutral:** better-sqlite3 requires native compilation — documented in README

### Confirmation
Architecture is correct when: domain unit tests have zero infrastructure imports; use case tests use fake repositories; integration tests use SQLite `:memory:` only.

## Pros and Cons of the Options

### Option A — DDD layered + SQLite + LRU cache
- ✅ Fully testable at every layer via interfaces
- ✅ Cache is swappable without touching use cases
- ✅ Domain rules enforced in one place (entities + value objects)
- ❌ More files and boilerplate than a simple approach
- ❌ better-sqlite3 native build adds install friction

### Option B — Flat architecture, direct SQLite
- ✅ Simpler to navigate for a small project
- ✅ Less boilerplate
- ❌ Commands become fat with mixed concerns (SQL + business logic + output)
- ❌ Hard to unit test without a real DB
- ❌ Adding cache requires touching every command

### Option C — JSON file storage
- ✅ Zero native dependencies — pure JavaScript
- ✅ Human-readable data file
- ❌ No structured queries — filtering requires full in-memory scan
- ❌ Poor performance at scale (> 1k todos)
- ❌ No transactions or atomic writes

## Review Trigger
Revisit if the tool needs to support multiple users or a shared database — at that point, consider a proper DB server and async repository interfaces.
