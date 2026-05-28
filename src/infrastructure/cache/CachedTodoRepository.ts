import { LRUCache } from 'lru-cache'
import type { Todo } from '../../domain/todo/Todo.js'
import type { TodoRepository } from '../../domain/todo/TodoRepository.js'
import type { TodoFilter } from '../../domain/shared/TodoFilter.js'

const DEFAULT_MAX = 200

/**
 * Repository decorator that caches findAll results in an LRU cache.
 * findById is not cached — it is only called during write operations (done, delete, edit).
 * Cache is fully invalidated on any write to ensure consistency.
 */
export class CachedTodoRepository implements TodoRepository {
  private readonly cache: LRUCache<string, Todo[]>

  constructor(
    private readonly inner: TodoRepository,
    maxEntries = DEFAULT_MAX,
  ) {
    this.cache = new LRUCache({ max: maxEntries })
  }

  findById(id: string): Todo | undefined {
    return this.inner.findById(id)
  }

  findAll(filter?: TodoFilter): Todo[] {
    const key = JSON.stringify(filter ?? {})
    const cached = this.cache.get(key)
    if (cached) return cached
    const result = this.inner.findAll(filter)
    this.cache.set(key, result)
    return result
  }

  save(todo: Todo): void {
    this.inner.save(todo)
    this.cache.clear()
  }

  delete(id: string): void {
    this.inner.delete(id)
    this.cache.clear()
  }
}
