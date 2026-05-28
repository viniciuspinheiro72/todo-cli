import type { Command } from 'commander'
import { ListTodos } from '../../application/todo/ListTodos.js'
import { formatTodoList } from '../formatters/todo-formatter.js'
import type { TodoRepository } from '../../domain/todo/TodoRepository.js'
import type { TodoFilter } from '../../domain/shared/TodoFilter.js'
import type { StatusLevel } from '../../domain/todo/TodoStatus.js'
import type { PriorityLevel } from '../../domain/todo/Priority.js'

export function registerList(program: Command, todoRepo: TodoRepository): void {
  program
    .command('list')
    .alias('ls')
    .description('List todos')
    .option('-s, --status <status>', 'Filter by status: pending, done, all')
    .option('-p, --priority <level>', 'Filter by priority')
    .option('-t, --tag <tag>', 'Filter by tag')
    .option('--project <name>', 'Filter by project')
    .option('--due-before <date>', 'Filter by due date before YYYY-MM-DD')
    .option('--overdue', 'Show only overdue todos')
    .action((opts: { status?: string; priority?: string; tag?: string; project?: string; dueBefore?: string; overdue?: boolean }) => {
      const filter: TodoFilter = {}
      if (opts.status && opts.status !== 'all') filter.status = opts.status as StatusLevel
      if (opts.priority) filter.priority = opts.priority as PriorityLevel
      if (opts.tag) filter.tag = opts.tag.toLowerCase()
      if (opts.project) filter.projectName = opts.project
      if (opts.dueBefore) filter.dueBefore = opts.dueBefore
      if (opts.overdue) filter.overdue = true

      const todos = new ListTodos(todoRepo).execute(filter)
      console.log(formatTodoList(todos))
    })
}
