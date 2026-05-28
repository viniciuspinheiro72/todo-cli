import type { DB } from '../database/Database.js'
import { Todo } from '../../domain/todo/Todo.js'
import { Priority } from '../../domain/todo/Priority.js'
import { TodoStatus } from '../../domain/todo/TodoStatus.js'
import { Tag } from '../../domain/todo/Tag.js'
import { DueDate } from '../../domain/todo/DueDate.js'
import type { TodoRepository } from '../../domain/todo/TodoRepository.js'
import type { TodoFilter } from '../../domain/shared/TodoFilter.js'

interface TodoRow {
  id: string
  title: string
  description: string | null
  priority: string
  due_date: string | null
  status: string
  project_id: string | null
  created_at: string
  updated_at: string
  tags: string | null
}

function toTodo(row: TodoRow): Todo {
  return Todo.reconstitute({
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    priority: Priority.from(row.priority),
    dueDate: row.due_date ? DueDate.from(row.due_date) : undefined,
    tags: row.tags ? row.tags.split(',').filter(Boolean).map(Tag.from) : [],
    projectId: row.project_id ?? undefined,
    status: TodoStatus.from(row.status),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  })
}

const BASE = `
  SELECT t.*, group_concat(tt.tag) as tags
  FROM todos t
  LEFT JOIN todo_tags tt ON tt.todo_id = t.id
`

export class SqliteTodoRepository implements TodoRepository {
  constructor(private readonly db: DB) {}

  findById(id: string): Todo | undefined {
    const row = this.db.prepare(`${BASE} WHERE (t.id = ? OR t.id LIKE ?) GROUP BY t.id`).get(id, `${id}%`) as TodoRow | undefined
    return row ? toTodo(row) : undefined
  }

  findAll(filter?: TodoFilter): Todo[] {
    const conditions: string[] = []
    const params: Record<string, string | number> = {}

    if (filter?.overdue) {
      conditions.push("t.status = 'pending'")
      conditions.push("t.due_date IS NOT NULL AND t.due_date < date('now')")
    } else if (filter?.status) {
      conditions.push('t.status = :status')
      params.status = filter.status
    } else {
      conditions.push("t.status = 'pending'")
    }

    if (filter?.priority) { conditions.push('t.priority = :priority'); params.priority = filter.priority }
    if (filter?.dueBefore) { conditions.push('t.due_date < :dueBefore'); params.dueBefore = filter.dueBefore }

    let query = BASE
    if (filter?.projectName) {
      query += ' JOIN projects p ON p.id = t.project_id'
      conditions.push('p.name = :projectName')
      params.projectName = filter.projectName.toLowerCase()
    }

    if (conditions.length) query += ` WHERE ${conditions.join(' AND ')}`
    query += ' GROUP BY t.id'

    if (filter?.tag) {
      query += ` HAVING (tags = :tag OR tags LIKE :tagStart OR tags LIKE :tagEnd OR tags LIKE :tagMid)`
      params.tag = filter.tag
      params.tagStart = `${filter.tag},%`
      params.tagEnd = `%,${filter.tag}`
      params.tagMid = `%,${filter.tag},%`
    }

    query += ` ORDER BY CASE t.priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 WHEN 'low' THEN 2 ELSE 3 END, t.due_date ASC NULLS LAST, t.created_at ASC`

    const rows = this.db.prepare(query).all(params) as unknown as TodoRow[]
    return rows.map(toTodo)
  }

  save(todo: Todo): void {
    this.db.exec('BEGIN')
    try {
      this.db.prepare(`
        INSERT INTO todos (id, title, description, priority, due_date, status, project_id, created_at, updated_at)
        VALUES (:id, :title, :description, :priority, :dueDate, :status, :projectId, :createdAt, :updatedAt)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title, description = excluded.description,
          priority = excluded.priority, due_date = excluded.due_date,
          status = excluded.status, project_id = excluded.project_id,
          updated_at = excluded.updated_at
      `).run({
        id: todo.id, title: todo.title,
        description: todo.description ?? null,
        priority: todo.priority.value,
        dueDate: todo.dueDate?.value ?? null,
        status: todo.status.value,
        projectId: todo.projectId ?? null,
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt.toISOString(),
      })
      this.db.prepare('DELETE FROM todo_tags WHERE todo_id = ?').run(todo.id)
      const insertTag = this.db.prepare('INSERT OR IGNORE INTO todo_tags (todo_id, tag) VALUES (?, ?)')
      for (const tag of todo.tags) insertTag.run(todo.id, tag.value)
      this.db.exec('COMMIT')
    } catch (err) {
      this.db.exec('ROLLBACK')
      throw err
    }
  }

  delete(id: string): void {
    this.db.prepare("DELETE FROM todos WHERE id = ? OR id LIKE ?").run(id, `${id}%`)
  }
}
