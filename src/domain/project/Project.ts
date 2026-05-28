import { randomUUID } from 'crypto'
import { DomainError } from '../shared/DomainError.js'

export interface ProjectProps {
  id: string
  name: string
  createdAt: Date
}

export class Project {
  readonly id: string
  readonly name: string
  readonly createdAt: Date

  private constructor(props: ProjectProps) {
    this.id = props.id
    this.name = props.name
    this.createdAt = props.createdAt
  }

  static create(name: string): Project {
    const normalized = name.trim().toLowerCase()
    if (!normalized) throw new DomainError('Project name cannot be empty')
    if (!/^[\w-]+$/.test(normalized))
      throw new DomainError(`Invalid project name "${name}". Only letters, numbers, and hyphens allowed.`)
    return new Project({ id: randomUUID(), name: normalized, createdAt: new Date() })
  }

  static reconstitute(props: ProjectProps): Project {
    return new Project(props)
  }
}
