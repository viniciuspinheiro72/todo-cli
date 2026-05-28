import type { PriorityLevel } from '../todo/Priority.js'
import type { StatusLevel } from '../todo/TodoStatus.js'

export interface TodoFilter {
  status?: StatusLevel
  priority?: PriorityLevel
  tag?: string
  projectName?: string
  dueBefore?: string
  overdue?: boolean
}
