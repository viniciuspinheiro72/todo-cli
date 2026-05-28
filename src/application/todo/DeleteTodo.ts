import type { TodoRepository } from '../../domain/todo/TodoRepository.js'
import { NotFoundError } from '../../domain/shared/DomainError.js'

export class DeleteTodo {
  constructor(private readonly todoRepository: TodoRepository) {}

  execute(id: string): void {
    const todo = this.todoRepository.findById(id)
    if (!todo) throw new NotFoundError('Todo', id)
    this.todoRepository.delete(todo.id)
  }
}
