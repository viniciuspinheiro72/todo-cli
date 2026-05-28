import { DomainError } from '../shared/DomainError.js'

export type StatusLevel = 'pending' | 'done'

export class TodoStatus {
  private constructor(readonly value: StatusLevel) {}

  static pending(): TodoStatus { return new TodoStatus('pending') }
  static done(): TodoStatus { return new TodoStatus('done') }

  static from(raw: string): TodoStatus {
    if (raw !== 'pending' && raw !== 'done')
      throw new DomainError(`Invalid status "${raw}". Valid: pending, done`)
    return new TodoStatus(raw)
  }

  isPending(): boolean { return this.value === 'pending' }
  isDone(): boolean { return this.value === 'done' }
}
