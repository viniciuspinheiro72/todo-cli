import type { Todo } from './Todo.js'
import type { TodoFilter } from '../shared/TodoFilter.js'

export interface TodoRepository {
  findById(id: string): Todo | undefined
  findAll(filter?: TodoFilter): Todo[]
  save(todo: Todo): void
  delete(id: string): void
}
