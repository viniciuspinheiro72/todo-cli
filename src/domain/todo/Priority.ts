import { DomainError } from '../shared/DomainError.js'

export type PriorityLevel = 'high' | 'medium' | 'low' | 'none'

const VALID: PriorityLevel[] = ['high', 'medium', 'low', 'none']
const ORDER: Record<PriorityLevel, number> = { high: 0, medium: 1, low: 2, none: 3 }

export class Priority {
  private constructor(readonly value: PriorityLevel) {}

  static from(raw: string): Priority {
    if (!VALID.includes(raw as PriorityLevel))
      throw new DomainError(`Invalid priority "${raw}". Valid: ${VALID.join(', ')}`)
    return new Priority(raw as PriorityLevel)
  }

  static none(): Priority {
    return new Priority('none')
  }

  sortOrder(): number {
    return ORDER[this.value]
  }

  equals(other: Priority): boolean {
    return this.value === other.value
  }
}
