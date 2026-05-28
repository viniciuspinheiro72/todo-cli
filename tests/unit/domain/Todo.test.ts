import { describe, it, expect } from 'vitest'
import { Todo } from '../../../src/domain/todo/Todo.js'
import { Priority } from '../../../src/domain/todo/Priority.js'
import { Tag } from '../../../src/domain/todo/Tag.js'
import { DueDate } from '../../../src/domain/todo/DueDate.js'
import { DomainError } from '../../../src/domain/shared/DomainError.js'

describe('Todo.create', () => {
  it('creates a pending todo with defaults', () => {
    const todo = Todo.create({ title: 'Buy milk' })
    expect(todo.title).toBe('Buy milk')
    expect(todo.status.isPending()).toBe(true)
    expect(todo.priority.value).toBe('none')
    expect(todo.tags).toHaveLength(0)
  })

  it('creates a todo with all fields', () => {
    const todo = Todo.create({
      title: 'Fix bug',
      priority: Priority.from('high'),
      dueDate: DueDate.from('2030-01-01'),
      tags: [Tag.from('backend')],
    })
    expect(todo.priority.value).toBe('high')
    expect(todo.dueDate?.value).toBe('2030-01-01')
    expect(todo.tags[0].value).toBe('backend')
  })

  it('throws DomainError for empty title', () => {
    expect(() => Todo.create({ title: '  ' })).toThrow(DomainError)
  })

  it('trims title whitespace', () => {
    const todo = Todo.create({ title: '  Fix bug  ' })
    expect(todo.title).toBe('Fix bug')
  })
})

describe('Todo.complete', () => {
  it('marks pending todo as done', () => {
    const todo = Todo.create({ title: 'Test' })
    todo.complete()
    expect(todo.status.isDone()).toBe(true)
  })

  it('throws if already done', () => {
    const todo = Todo.create({ title: 'Test' })
    todo.complete()
    expect(() => todo.complete()).toThrow(DomainError)
  })
})

describe('Todo.edit', () => {
  it('updates only provided fields', () => {
    const todo = Todo.create({ title: 'Original', priority: Priority.from('low') })
    todo.edit({ title: 'Updated' })
    expect(todo.title).toBe('Updated')
    expect(todo.priority.value).toBe('low')
  })

  it('clears dueDate when null passed', () => {
    const todo = Todo.create({ title: 'Test', dueDate: DueDate.from('2030-01-01') })
    todo.edit({ dueDate: null })
    expect(todo.dueDate).toBeUndefined()
  })
})

describe('Priority', () => {
  it('parses valid levels', () => {
    expect(Priority.from('high').value).toBe('high')
    expect(Priority.from('none').value).toBe('none')
  })

  it('throws for invalid level', () => {
    expect(() => Priority.from('urgent')).toThrow(DomainError)
  })

  it('sorts correctly', () => {
    const priorities = ['none', 'low', 'medium', 'high'].map(Priority.from)
    const sorted = [...priorities].sort((a, b) => a.sortOrder() - b.sortOrder())
    expect(sorted.map((p) => p.value)).toEqual(['high', 'medium', 'low', 'none'])
  })
})

describe('Tag', () => {
  it('normalizes to lowercase', () => {
    expect(Tag.from('Backend').value).toBe('backend')
  })

  it('throws for empty tag', () => {
    expect(() => Tag.from('')).toThrow(DomainError)
  })

  it('throws for invalid characters', () => {
    expect(() => Tag.from('my tag')).toThrow(DomainError)
  })
})

describe('DueDate', () => {
  it('parses valid ISO date', () => {
    expect(DueDate.from('2030-01-15').value).toBe('2030-01-15')
  })

  it('throws for invalid format', () => {
    expect(() => DueDate.from('01/15/2030')).toThrow(DomainError)
  })

  it('detects past dates as overdue', () => {
    expect(DueDate.from('2020-01-01').isOverdue()).toBe(true)
  })

  it('detects future dates as not overdue', () => {
    expect(DueDate.from('2099-12-31').isOverdue()).toBe(false)
  })
})
