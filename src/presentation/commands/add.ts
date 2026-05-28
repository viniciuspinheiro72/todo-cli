import type { Command } from 'commander'
import chalk from 'chalk'
import { CreateTodo } from '../../application/todo/CreateTodo.js'
import type { TodoRepository } from '../../domain/todo/TodoRepository.js'
import type { ProjectRepository } from '../../domain/project/ProjectRepository.js'

export function registerAdd(program: Command, todoRepo: TodoRepository, projectRepo: ProjectRepository): void {
  program
    .command('add <title>')
    .description('Add a new todo')
    .option('-d, --desc <description>', 'Description')
    .option('-p, --priority <level>', 'Priority: high, medium, low, none', 'none')
    .option('-D, --due <date>', 'Due date (YYYY-MM-DD)')
    .option('-t, --tag <tags>', 'Comma-separated tags')
    .option('-P, --project <name>', 'Project name')
    .action((title: string, opts: { desc?: string; priority: string; due?: string; tag?: string; project?: string }) => {
      const useCase = new CreateTodo(todoRepo, projectRepo)
      const todo = useCase.execute({
        title,
        description: opts.desc,
        priority: opts.priority,
        dueDate: opts.due,
        tags: opts.tag ? opts.tag.split(',').map((t) => t.trim()) : [],
        projectName: opts.project,
      })
      console.log(`${chalk.green('✓')} Added ${chalk.bold(todo.shortId())} — ${todo.title}`)
    })
}
