import type { TodoRepository } from '../../domain/todo/TodoRepository.js'
import type { ProjectRepository } from '../../domain/project/ProjectRepository.js'
import { Priority } from '../../domain/todo/Priority.js'
import { Tag } from '../../domain/todo/Tag.js'
import { DueDate } from '../../domain/todo/DueDate.js'
import { Project } from '../../domain/project/Project.js'
import { NotFoundError } from '../../domain/shared/DomainError.js'

export interface EditTodoCommand {
  id: string
  title?: string
  description?: string
  priority?: string
  dueDate?: string | null
  tags?: string[]
  projectName?: string | null
}

export class EditTodo {
  constructor(
    private readonly todoRepository: TodoRepository,
    private readonly projectRepository: ProjectRepository,
  ) {}

  execute(command: EditTodoCommand): void {
    const todo = this.todoRepository.findById(command.id)
    if (!todo) throw new NotFoundError('Todo', command.id)

    let projectId: string | null | undefined = undefined
    if (command.projectName !== undefined) {
      if (command.projectName === null) {
        projectId = null
      } else {
        const name = command.projectName.toLowerCase()
        let project = this.projectRepository.findByName(name)
        if (!project) { project = Project.create(name); this.projectRepository.save(project) }
        projectId = project.id
      }
    }

    todo.edit({
      title: command.title,
      description: command.description,
      priority: command.priority ? Priority.from(command.priority) : undefined,
      dueDate: command.dueDate === null ? null : command.dueDate ? DueDate.from(command.dueDate) : undefined,
      tags: command.tags?.map(Tag.from),
      projectId,
    })

    this.todoRepository.save(todo)
  }
}
