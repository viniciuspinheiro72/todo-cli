import { randomUUID } from 'crypto'
import { Priority } from './Priority.js'
import { TodoStatus } from './TodoStatus.js'
import { Tag } from './Tag.js'
import { DueDate } from './DueDate.js'
import { DomainError } from '../shared/DomainError.js'

export interface TodoProps {
  id: string
  title: string
  description?: string
  priority: Priority
  dueDate?: DueDate
  tags: Tag[]
  projectId?: string
  status: TodoStatus
  createdAt: Date
  updatedAt: Date
}

export interface CreateTodoProps {
  title: string
  description?: string
  priority?: Priority
  dueDate?: DueDate
  tags?: Tag[]
  projectId?: string
}

export interface EditTodoProps {
  title?: string
  description?: string
  priority?: Priority
  dueDate?: DueDate | null
  tags?: Tag[]
  projectId?: string | null
}

export class Todo {
  readonly id: string
  title: string
  description?: string
  priority: Priority
  dueDate?: DueDate
  tags: Tag[]
  projectId?: string
  status: TodoStatus
  readonly createdAt: Date
  updatedAt: Date

  private constructor(props: TodoProps) {
    this.id = props.id
    this.title = props.title
    this.description = props.description
    this.priority = props.priority
    this.dueDate = props.dueDate
    this.tags = props.tags
    this.projectId = props.projectId
    this.status = props.status
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(props: CreateTodoProps): Todo {
    if (!props.title.trim()) throw new DomainError('Todo title cannot be empty')
    const now = new Date()
    return new Todo({
      id: randomUUID(),
      title: props.title.trim(),
      description: props.description,
      priority: props.priority ?? Priority.none(),
      dueDate: props.dueDate,
      tags: props.tags ?? [],
      projectId: props.projectId,
      status: TodoStatus.pending(),
      createdAt: now,
      updatedAt: now,
    })
  }

  static reconstitute(props: TodoProps): Todo {
    return new Todo(props)
  }

  complete(): void {
    if (this.status.isDone()) throw new DomainError('Todo is already done')
    this.status = TodoStatus.done()
    this.updatedAt = new Date()
  }

  edit(props: EditTodoProps): void {
    if (props.title !== undefined) {
      if (!props.title.trim()) throw new DomainError('Todo title cannot be empty')
      this.title = props.title.trim()
    }
    if (props.description !== undefined) this.description = props.description
    if (props.priority !== undefined) this.priority = props.priority
    if (props.dueDate !== undefined) this.dueDate = props.dueDate ?? undefined
    if (props.tags !== undefined) this.tags = props.tags
    if (props.projectId !== undefined) this.projectId = props.projectId ?? undefined
    this.updatedAt = new Date()
  }

  shortId(): string {
    return this.id.slice(0, 8)
  }
}
