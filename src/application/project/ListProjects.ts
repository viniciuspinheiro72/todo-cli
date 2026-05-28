import type { Project } from '../../domain/project/Project.js'
import type { ProjectRepository } from '../../domain/project/ProjectRepository.js'
import type { TodoRepository } from '../../domain/todo/TodoRepository.js'

export interface ProjectWithCount {
  project: Project
  count: number
}

export class ListProjects {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly todoRepository: TodoRepository,
  ) {}

  execute(): ProjectWithCount[] {
    const projects = this.projectRepository.findAll()
    return projects.map((project) => ({
      project,
      count: this.todoRepository.findAll({ projectName: project.name }).length,
    }))
  }
}
