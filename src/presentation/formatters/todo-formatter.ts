import chalk from 'chalk'
import type { Todo } from '../../domain/todo/Todo.js'

const PRIORITY_COLOR: Record<string, (s: string) => string> = {
  high: chalk.red,
  medium: chalk.yellow,
  low: chalk.blue,
  none: chalk.gray,
}

export function formatTodo(todo: Todo): string {
  const id = chalk.dim(todo.shortId())
  const status = todo.status.isDone() ? chalk.green('✓') : chalk.dim('○')
  const title = todo.status.isDone() ? chalk.dim(todo.title) : todo.title
  const priority = todo.priority.value !== 'none'
    ? PRIORITY_COLOR[todo.priority.value](`[${todo.priority.value}]`)
    : ''
  const due = todo.dueDate
    ? todo.dueDate.isOverdue() && todo.status.isPending()
      ? chalk.red(`due:${todo.dueDate.value}`)
      : chalk.dim(`due:${todo.dueDate.value}`)
    : ''
  const tags = todo.tags.length ? chalk.cyan(todo.tags.map((t) => `#${t.value}`).join(' ')) : ''
  const parts = [status, id, priority, title, due, tags].filter(Boolean)
  return parts.join(' ')
}

export function formatTodoList(todos: Todo[]): string {
  if (!todos.length) return chalk.dim('  No todos found.')
  return todos.map((t) => `  ${formatTodo(t)}`).join('\n')
}
