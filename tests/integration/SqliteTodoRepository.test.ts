import { describe, it, expect, beforeEach } from 'vitest'
import { openDatabase } from '../../src/infrastructure/database/Database.js'
import { SqliteTodoRepository } from '../../src/infrastructure/repositories/SqliteTodoRepository.js'
import { SqliteProjectRepository } from '../../src/infrastructure/repositories/SqliteProjectRepository.js'
import { Todo } from '../../src/domain/todo/Todo.js'
import { Priority } from '../../src/domain/todo/Priority.js'
import { Tag } from '../../src/domain/todo/Tag.js'
import { DueDate } from '../../src/domain/todo/DueDate.js'
import { Project } from '../../src/domain/project/Project.js'

function makeDb() {
  process.env.TODO_DB_PATH = ':memory:'
  return openDatabase(':memory:')
}

let todoRepo: SqliteTodoRepository
let projectRepo: SqliteProjectRepository

beforeEach(() => {
  const db = makeDb()
  todoRepo = new SqliteTodoRepository(db)
  projectRepo = new SqliteProjectRepository(db)
})

describe('SqliteTodoRepository', () => {
  it('saves and retrieves a todo', () => {
    const todo = Todo.create({ title: 'Test todo' })
    todoRepo.save(todo)
    const found = todoRepo.findById(todo.id)
    expect(found?.title).toBe('Test todo')
  })

  it('finds todo by short ID prefix', () => {
    const todo = Todo.create({ title: 'Short ID test' })
    todoRepo.save(todo)
    const found = todoRepo.findById(todo.id.slice(0, 8))
    expect(found?.id).toBe(todo.id)
  })

  it('saves and retrieves tags', () => {
    const todo = Todo.create({ title: 'Tagged', tags: [Tag.from('backend'), Tag.from('urgent')] })
    todoRepo.save(todo)
    const found = todoRepo.findById(todo.id)
    expect(found?.tags.map((t) => t.value).sort()).toEqual(['backend', 'urgent'])
  })

  it('updates tags on re-save', () => {
    const todo = Todo.create({ title: 'Tagged', tags: [Tag.from('old')] })
    todoRepo.save(todo)
    todo.edit({ tags: [Tag.from('new')] })
    todoRepo.save(todo)
    const found = todoRepo.findById(todo.id)
    expect(found?.tags.map((t) => t.value)).toEqual(['new'])
  })

  it('filters by status', () => {
    const pending = Todo.create({ title: 'Pending' })
    const done = Todo.create({ title: 'Done' })
    done.complete()
    todoRepo.save(pending)
    todoRepo.save(done)
    const results = todoRepo.findAll({ status: 'done' })
    expect(results.every((t) => t.status.isDone())).toBe(true)
  })

  it('filters by priority', () => {
    const high = Todo.create({ title: 'High', priority: Priority.from('high') })
    const low = Todo.create({ title: 'Low', priority: Priority.from('low') })
    todoRepo.save(high)
    todoRepo.save(low)
    const results = todoRepo.findAll({ priority: 'high' })
    expect(results).toHaveLength(1)
    expect(results[0].priority.value).toBe('high')
  })

  it('deletes a todo', () => {
    const todo = Todo.create({ title: 'To delete' })
    todoRepo.save(todo)
    todoRepo.delete(todo.id)
    expect(todoRepo.findById(todo.id)).toBeUndefined()
  })

  it('saves todo with project and filters by project name', () => {
    const project = Project.create('api')
    projectRepo.save(project)
    const todo = Todo.create({ title: 'API task', projectId: project.id })
    todoRepo.save(todo)
    const results = todoRepo.findAll({ projectName: 'api' })
    expect(results).toHaveLength(1)
  })

  it('saves todo with due date', () => {
    const todo = Todo.create({ title: 'Due soon', dueDate: DueDate.from('2030-06-01') })
    todoRepo.save(todo)
    const found = todoRepo.findById(todo.id)
    expect(found?.dueDate?.value).toBe('2030-06-01')
  })
})
