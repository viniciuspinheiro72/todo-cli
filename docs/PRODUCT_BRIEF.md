# Product Brief

## What It Is
A terminal-native todo manager with priorities, due dates, tags, and projects — backed by SQLite with an in-memory LRU cache for fast reads.

## Who It's For
Developers and power users who live in the terminal and want a structured, queryable task list without leaving the shell.

## The Problem It Solves
Most CLI todo tools are either too simple (flat text files, no structure) or too heavy (require a server, an account, or a GUI). There is no well-architected, offline-first CLI tool that supports rich filtering, grouping by project, and tagging out of the box.

## Key Features
- Add todos with priority, due date, tags, and project
- Filter and list by any combination of attributes
- Mark done, edit, and delete todos
- Group todos by project or tag
- Fast reads via LRU cache over SQLite

## Business Objective
A well-tested, publishable npm CLI tool that becomes a daily driver for terminal-native developers.

## Out of Scope
- GUI, web app, or TUI
- Cloud sync or team collaboration
- Recurring tasks or reminders
- Time tracking
