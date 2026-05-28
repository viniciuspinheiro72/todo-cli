#!/usr/bin/env node
import { Command } from 'commander'
import { openDatabase } from './infrastructure/database/Database.js'
import { SqliteTodoRepository } from './infrastructure/repositories/SqliteTodoRepository.js'
import { SqliteProjectRepository } from './infrastructure/repositories/SqliteProjectRepository.js'
import { CachedTodoRepository } from './infrastructure/cache/CachedTodoRepository.js'
import { registerAdd } from './presentation/commands/add.js'
import { registerList } from './presentation/commands/list.js'
import { registerDone } from './presentation/commands/done.js'
import { registerDelete } from './presentation/commands/delete.js'
import { registerEdit } from './presentation/commands/edit.js'
import { registerProjects } from './presentation/commands/projects.js'
import { registerTags } from './presentation/commands/tags.js'
import { DomainError } from './domain/shared/DomainError.js'

const db = openDatabase()
const sqliteTodoRepo = new SqliteTodoRepository(db)
const todoRepo = new CachedTodoRepository(sqliteTodoRepo, Number(process.env.TODO_CACHE_SIZE) || 200)
const projectRepo = new SqliteProjectRepository(db)

const program = new Command()
program.name('todo').description('Terminal-native todo manager').version('0.1.0')

registerAdd(program, todoRepo, projectRepo)
registerList(program, todoRepo)
registerDone(program, todoRepo)
registerDelete(program, todoRepo)
registerEdit(program, todoRepo, projectRepo)
registerProjects(program, projectRepo, todoRepo)
registerTags(program, todoRepo)

program.parseAsync().catch((err: unknown) => {
  if (err instanceof DomainError) {
    process.stderr.write(`Error: ${err.message}\n`)
  } else {
    process.stderr.write(`Unexpected error: ${String(err)}\n`)
  }
  process.exitCode = 1
})
