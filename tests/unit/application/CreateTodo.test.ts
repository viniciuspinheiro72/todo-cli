import { describe, it, expect, beforeEach } from 'vitest'
import { CreateTodo } from '../../../src/application/todo/CreateTodo.js'
import type { TodoRepository } from '../../../src/domain/todo/TodoRepository.js'
import type { ProjectRepository } from '../../../src/domain/project/ProjectRepository.js'
import type { Todo } from '../../../src/domain/todo/Todo.js'
import type { TodoFilter } from '../../../src/domain/shared/TodoFilter.js'
import type { Project } from '../../../src/domain/project/Project.js'

class FakeTodoRepository implements TodoRepository {
  private store = new Map<string, Todo>()
  findById(id: string) { return [...this.store.values()].find((t) => t.id.startsWith(id)) }
  findAll(_filter?: TodoFilter) { return [...this.store.values()] }
  save(todo: Todo) { this.store.set(todo.id, todo) }
  delete(id: string) { this.store.delete(id) }
}

class FakeProjectRepository implements ProjectRepository {
  private store = new Map<string, Project>()
  findById(id: string) { return this.store.get(id) }
  findByName(name: string) { return [...this.store.values()].find((p) => p.name === name) }
  findAll() { return [...this.store.values()] }
  save(project: Project) { this.store.set(project.id, project) }
  delete(id: string) { this.store.delete(id) }
}

let todoRepo: FakeTodoRepository
let projectRepo: FakeProjectRepository
let useCase: CreateTodo

beforeEach(() => {
  todoRepo = new FakeTodoRepository()
  projectRepo = new FakeProjectRepository()
  useCase = new CreateTodo(todoRepo, projectRepo)
})

describe('CreateTodo', () => {
  it('creates and saves a todo', () => {
    const todo = useCase.execute({ title: 'Buy groceries' })
    expect(todo.title).toBe('Buy groceries')
    expect(todoRepo.findById(todo.id)).toBeDefined()
  })

  it('sets priority when provided', () => {
    const todo = useCase.execute({ title: 'Fix bug', priority: 'high' })
    expect(todo.priority.value).toBe('high')
  })

  it('creates project implicitly on first use', () => {
    useCase.execute({ title: 'Fix API bug', projectName: 'api' })
    expect(projectRepo.findByName('api')).toBeDefined()
  })

  it('reuses existing project', () => {
    useCase.execute({ title: 'Task 1', projectName: 'api' })
    useCase.execute({ title: 'Task 2', projectName: 'api' })
    expect(projectRepo.findAll()).toHaveLength(1)
  })

  it('splits tags correctly', () => {
    const todo = useCase.execute({ title: 'Test', tags: ['backend', 'urgent'] })
    expect(todo.tags.map((t) => t.value)).toEqual(['backend', 'urgent'])
  })
})
