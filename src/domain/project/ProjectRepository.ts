import type { Project } from './Project.js'

export interface ProjectRepository {
  findById(id: string): Project | undefined
  findByName(name: string): Project | undefined
  findAll(): Project[]
  save(project: Project): void
  delete(id: string): void
}
