import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CachedTodoRepository } from '../../src/infrastructure/cache/CachedTodoRepository.js'
import { openDatabase } from '../../src/infrastructure/database/Database.js'
import { SqliteTodoRepository } from '../../src/infrastructure/repositories/SqliteTodoRepository.js'
import { Todo } from '../../src/domain/todo/Todo.js'

let cached: CachedTodoRepository
let inner: SqliteTodoRepository

beforeEach(() => {
  const db = openDatabase(':memory:')
  inner = new SqliteTodoRepository(db)
  cached = new CachedTodoRepository(inner)
})

describe('CachedTodoRepository', () => {
  it('returns results from inner on first call', () => {
    const todo = Todo.create({ title: 'Cached test' })
    inner.save(todo)
    const results = cached.findAll()
    expect(results).toHaveLength(1)
  })

  it('serves subsequent reads from cache (inner not called again)', () => {
    const todo = Todo.create({ title: 'Cache hit' })
    inner.save(todo)
    cached.findAll()
    const findAllSpy = vi.spyOn(inner, 'findAll')
    cached.findAll()
    expect(findAllSpy).not.toHaveBeenCalled()
  })

  it('invalidates cache on save', () => {
    const todo = Todo.create({ title: 'Before' })
    cached.save(todo)
    cached.findAll()
    todo.edit({ title: 'After' })
    cached.save(todo)
    const results = cached.findAll()
    expect(results[0].title).toBe('After')
  })

  it('invalidates cache on delete', () => {
    const todo = Todo.create({ title: 'To delete' })
    cached.save(todo)
    cached.findAll()
    cached.delete(todo.id)
    const results = cached.findAll()
    expect(results).toHaveLength(0)
  })
})
