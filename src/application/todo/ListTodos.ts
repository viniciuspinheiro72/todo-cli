import type { Todo } from '../../domain/todo/Todo.js'
import type { TodoRepository } from '../../domain/todo/TodoRepository.js'
import type { TodoFilter } from '../../domain/shared/TodoFilter.js'

export class ListTodos {
  constructor(private readonly todoRepository: TodoRepository) {}

  execute(filter?: TodoFilter): Todo[] {
    return this.todoRepository.findAll(filter)
  }
}
