import type { Command } from 'commander'
import chalk from 'chalk'
import { DeleteTodo } from '../../application/todo/DeleteTodo.js'
import type { TodoRepository } from '../../domain/todo/TodoRepository.js'

export function registerDelete(program: Command, todoRepo: TodoRepository): void {
  program
    .command('delete <id>')
    .alias('rm')
    .description('Delete a todo')
    .action((id: string) => {
      new DeleteTodo(todoRepo).execute(id)
      console.log(`${chalk.red('✗')} Deleted ${chalk.bold(id)}`)
    })
}
