import { DomainError } from '../shared/DomainError.js'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export class DueDate {
  private constructor(readonly value: string) {}

  static from(raw: string): DueDate {
    if (!ISO_DATE.test(raw)) throw new DomainError(`Invalid due date "${raw}". Use YYYY-MM-DD format.`)
    const d = new Date(raw)
    if (isNaN(d.getTime())) throw new DomainError(`Invalid due date "${raw}".`)
    return new DueDate(raw)
  }

  isOverdue(): boolean {
    return this.value < new Date().toISOString().slice(0, 10)
  }

  isToday(): boolean {
    return this.value === new Date().toISOString().slice(0, 10)
  }
}
