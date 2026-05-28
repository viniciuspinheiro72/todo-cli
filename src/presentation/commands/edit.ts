import type { Command } from 'commander'
import chalk from 'chalk'
import { EditTodo } from '../../application/todo/EditTodo.js'
import type { TodoRepository } from '../../domain/todo/TodoRepository.js'
import type { ProjectRepository } from '../../domain/project/ProjectRepository.js'

export function registerEdit(program: Command, todoRepo: TodoRepository, projectRepo: ProjectRepository): void {
  program
    .command('edit <id>')
    .description('Edit a todo')
    .option('--title <title>', 'New title')
    .option('-d, --desc <description>', 'New description')
    .option('-p, --priority <level>', 'New priority: high, medium, low, none')
    .option('-D, --due <date>', 'New due date (YYYY-MM-DD), or "none" to clear')
    .option('-t, --tag <tags>', 'Replace tags (comma-separated)')
    .option('-P, --project <name>', 'New project, or "none" to clear')
    .action((id: string, opts: { title?: string; desc?: string; priority?: string; due?: string; tag?: string; project?: string }) => {
      new EditTodo(todoRepo, projectRepo).execute({
        id,
        title: opts.title,
        description: opts.desc,
        priority: opts.priority,
        dueDate: opts.due === 'none' ? null : opts.due,
        tags: opts.tag ? opts.tag.split(',').map((t) => t.trim()) : undefined,
        projectName: opts.project === 'none' ? null : opts.project,
      })
      console.log(`${chalk.green('✓')} Updated ${chalk.bold(id)}`)
    })
}
