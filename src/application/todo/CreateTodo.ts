import { Todo } from '../../domain/todo/Todo.js'
import { Priority } from '../../domain/todo/Priority.js'
import { Tag } from '../../domain/todo/Tag.js'
import { DueDate } from '../../domain/todo/DueDate.js'
import type { TodoRepository } from '../../domain/todo/TodoRepository.js'
import type { ProjectRepository } from '../../domain/project/ProjectRepository.js'
import { Project } from '../../domain/project/Project.js'

export interface CreateTodoCommand {
  title: string
  description?: string
  priority?: string
  dueDate?: string
  tags?: string[]
  projectName?: string
}

export class CreateTodo {
  constructor(
    private readonly todoRepository: TodoRepository,
    private readonly projectRepository: ProjectRepository,
  ) {}

  execute(command: CreateTodoCommand): Todo {
    let projectId: string | undefined

    if (command.projectName) {
      const name = command.projectName.toLowerCase()
      let project = this.projectRepository.findByName(name)
      if (!project) {
        project = Project.create(name)
        this.projectRepository.save(project)
      }
      projectId = project.id
    }

    const todo = Todo.create({
      title: command.title,
      description: command.description,
      priority: command.priority ? Priority.from(command.priority) : undefined,
      dueDate: command.dueDate ? DueDate.from(command.dueDate) : undefined,
      tags: command.tags?.map(Tag.from) ?? [],
      projectId,
    })

    this.todoRepository.save(todo)
    return todo
  }
}
