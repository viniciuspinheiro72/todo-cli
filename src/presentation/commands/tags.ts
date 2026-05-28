import type { Command } from 'commander'
import chalk from 'chalk'
import { ListTodos } from '../../application/todo/ListTodos.js'
import type { TodoRepository } from '../../domain/todo/TodoRepository.js'

export function registerTags(program: Command, todoRepo: TodoRepository): void {
  program
    .command('tags')
    .description('List all tags with todo counts')
    .action(() => {
      const todos = new ListTodos(todoRepo).execute({ status: 'pending' })
      const counts = new Map<string, number>()
      for (const todo of todos) {
        for (const tag of todo.tags) counts.set(tag.value, (counts.get(tag.value) ?? 0) + 1)
      }
      if (!counts.size) { console.log(chalk.dim('  No tags yet.')); return }
      const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
      for (const [tag, count] of sorted) {
        console.log(`  ${chalk.cyan(`#${tag}`)} ${chalk.dim(`(${count})`)}`)
      }
    })
}
