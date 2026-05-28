import type { Command } from 'commander'
import chalk from 'chalk'
import { CompleteTodo } from '../../application/todo/CompleteTodo.js'
import type { TodoRepository } from '../../domain/todo/TodoRepository.js'

export function registerDone(program: Command, todoRepo: TodoRepository): void {
  program
    .command('done <id>')
    .description('Mark a todo as done')
    .action((id: string) => {
      new CompleteTodo(todoRepo).execute(id)
      console.log(`${chalk.green('✓')} Marked ${chalk.bold(id)} as done`)
    })
}
