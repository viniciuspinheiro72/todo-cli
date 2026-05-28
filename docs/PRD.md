# Product Requirements Document (PRD)

## Overview & Purpose
todo-cli is a terminal-native task manager that lets developers manage todos with priorities, due dates, tags, and projects entirely from the command line.

## Problem Statement
No modern npm CLI todo tool supports rich filtering, project grouping, and tagging while being zero-config and offline-first.

## Target Users & Personas
- **Developer Dana** — manages tasks per project, filters by priority and due date, runs `todo list --project api` daily
- **Power User Paulo** — tags everything, wants fast filtered output, lives in the shell

## Goals & Success Metrics
| Goal | Metric | Target |
|------|--------|--------|
| Adoption | npm weekly downloads | 200/week within 3 months |
| Performance | `todo list` response time | < 30ms (cache hit), < 100ms (cache miss) |
| Reliability | Test coverage | ≥ 80% statements, branches, functions |

## Scope

### MVP Features — P0
- `todo add` — create a todo with title, priority, due date, tags, project
- `todo list` — list todos with optional filters (status, priority, tag, project, due-before)
- `todo done <id>` — mark a todo as complete
- `todo delete <id>` — permanently remove a todo
- `todo edit <id>` — update any field of a todo
- `todo projects` — list all projects with todo counts
- `todo tags` — list all tags with todo counts
- Colored terminal output (priority-based colors)

### Important Features — P1
- `todo list --overdue` — show all past-due todos
- `todo list --today` — show todos due today
- Short ID display (first 8 chars of UUID)
- `todo show <id>` — show full detail of a single todo

### Nice-to-have — P2
- `todo archive` — move all done todos to archive table
- Shell completion (zsh/bash)
- `todo import` / `todo export` (JSON)

## Functional Requirements
- All data stored in `~/.todo/todos.db` (SQLite)
- IDs are UUIDs; display uses first 8 characters
- Priority values: `high`, `medium`, `low`, `none` (default: `none`)
- Tags are lowercase, alphanumeric + hyphens, comma-separated on input
- Due dates accept `YYYY-MM-DD` format
- `todo list` default: show pending todos sorted by priority then due date
- Completed todos hidden by default; shown with `--status done` or `--status all`
- Project names are case-insensitive; stored lowercase
- Deleting a project does NOT delete its todos — todos become project-less

## Non-Functional Requirements
| Attribute    | Requirement | Notes |
|--------------|-------------|-------|
| Performance  | < 30ms list (cache hit) | LRU cache covers this |
| Scalability  | Up to 10k todos | Single-user local tool |
| Availability | N/A | Local CLI |
| Security     | No network, no auth | Offline only |
| Accessibility| Color + text fallback | Never color-only information |

## User Stories & Acceptance Criteria

**As Developer Dana, I want to add a todo with full metadata so I can track it properly.**
- Given: valid input — When: `todo add "Fix auth bug" --priority high --due 2026-06-01 --tag backend --project api` — Then: todo is created, ID shown, cached entry invalidated.

**As Developer Dana, I want to filter todos by project so I can focus on one area.**
- Given: todos with mixed projects — When: `todo list --project api` — Then: only todos in project "api" shown.

**As Power User Paulo, I want to mark a todo done so it leaves my list.**
- Given: a pending todo with id `abc12345` — When: `todo done abc12345` — Then: status set to done, removed from default list.

**As Power User Paulo, I want to see overdue todos so I can reprioritize.**
- Given: todos with past due dates — When: `todo list --overdue` — Then: only todos with dueDate < today and status pending shown.

## Milestones & Releases
- v0.1 — P0 commands + colored output
- v0.2 — `--overdue`, `--today`, `todo show`
- v1.0 — stable API, published to npm

## Assumptions & Constraints
- Node.js ≥ 18 required (for better-sqlite3 v9+)
- Single-user tool — no concurrent write safety needed beyond SQLite's own guarantees
- LRU cache is per-process — two simultaneous CLI invocations each have their own cache (acceptable)

## Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| better-sqlite3 native build fails | Low | High | Pin Node.js version; document in README |
| ID collisions with short IDs | Very low | Low | Full UUID stored; short ID is display-only; prompt user for full ID on ambiguity |

## Open Questions
- Should `todo delete` require `--force` confirmation for safety?
- Should tags be stored as a normalized table or JSON column?
