import type { DB } from '../database/Database.js'
import { Project } from '../../domain/project/Project.js'
import type { ProjectRepository } from '../../domain/project/ProjectRepository.js'

interface ProjectRow {
  id: string
  name: string
  created_at: string
}

function toProject(row: ProjectRow): Project {
  return Project.reconstitute({ id: row.id, name: row.name, createdAt: new Date(row.created_at) })
}

export class SqliteProjectRepository implements ProjectRepository {
  constructor(private readonly db: DB) {}

  findById(id: string): Project | undefined {
    const row = this.db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as ProjectRow | undefined
    return row ? toProject(row) : undefined
  }

  findByName(name: string): Project | undefined {
    const row = this.db.prepare('SELECT * FROM projects WHERE name = ?').get(name.toLowerCase()) as ProjectRow | undefined
    return row ? toProject(row) : undefined
  }

  findAll(): Project[] {
    const rows = this.db.prepare('SELECT * FROM projects ORDER BY name').all() as unknown as ProjectRow[]
    return rows.map(toProject)
  }

  save(project: Project): void {
    this.db.prepare(`
      INSERT INTO projects (id, name, created_at)
      VALUES (:id, :name, :createdAt)
      ON CONFLICT(id) DO UPDATE SET name = excluded.name
    `).run({ id: project.id, name: project.name, createdAt: project.createdAt.toISOString() })
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM projects WHERE id = ?').run(id)
  }
}
