# Research Document

---

## Part 1 — Market Research

### Problem Statement
Terminal users who want structured task management face a gap: simple tools (todo.txt, t) lack filtering and grouping, while powerful tools (Taskwarrior) are complex to configure and have steep learning curves. There is no modern, npm-installable CLI with DDD internals, SQLite persistence, and rich filtering that works out of the box.

### Target Users
- **Developer Dana** — Full-stack developer, manages tasks per project, wants `todo list --project api` to just work
- **Power User Paulo** — Lives in the terminal, tags everything, wants fast filtered lists without leaving the shell

### Competitor / Prior Art Analysis
| Name | Strengths | Weaknesses | URL |
|------|-----------|------------|-----|
| Taskwarrior | Feature-rich, battle-tested | Complex config, C++ binary, not npm | taskwarrior.org |
| todo.txt | Simple, portable | No structure, no filtering | todotxt.net |
| `t` (npm) | Minimal, fast | No priorities, tags, or projects | npmjs.com/package/t |
| Todoman | CalDAV sync | Requires server, not terminal-first | github.com/pimutils/todoman |

### Market Opportunity
No modern, zero-config npm CLI exists with DDD internals, SQLite, priorities, tags, and projects. The target user installs it with one command and gets a production-quality tool immediately.

### Go / No-Go Decision
**Go** — clear gap, daily personal utility, good showcase of DDD + caching patterns.

---

## Part 2 — Technical Research

### Technical Feasibility
Fully feasible. better-sqlite3 is the gold standard for synchronous SQLite in Node.js. LRU cache as a repository decorator is a well-understood pattern. DDD layering is straightforward in TypeScript with interfaces for repository contracts.

### Third-Party Services & APIs
| Service | Purpose | Pricing Model | Risk |
|---------|---------|---------------|------|
| better-sqlite3 | SQLite driver (synchronous) | Free / MIT | Low — widely used, well maintained |
| lru-cache | LRU cache implementation | Free / ISC | Low — standard npm package |
| commander | CLI arg parsing | Free / MIT | Low — industry standard |
| uuid | UUID generation for todo IDs | Free / MIT | Low |
| chalk | Terminal color output | Free / MIT | Low |
| date-fns | Due date parsing and formatting | Free / MIT | Low |

### Key Technical Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| better-sqlite3 native bindings fail on some platforms | Low | High | Document Node.js version requirement; test on Linux and macOS |
| Cache serving stale data after concurrent CLI invocations | Medium | Medium | Cache is per-process only — two concurrent processes each have their own cache; acceptable since CLI is single-user |
| SQLite WAL mode conflicts | Low | Low | Enable WAL mode for better concurrent read performance |

### Proof of Concept Needed?
None — better-sqlite3 + lru-cache is a proven combination. The repository decorator pattern is well-established.
