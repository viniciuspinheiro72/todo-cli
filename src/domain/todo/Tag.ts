import { DomainError } from '../shared/DomainError.js'

export class Tag {
  private constructor(readonly value: string) {}

  static from(raw: string): Tag {
    const normalized = raw.trim().toLowerCase()
    if (!normalized) throw new DomainError('Tag cannot be empty')
    if (!/^[\w-]+$/.test(normalized))
      throw new DomainError(`Invalid tag "${raw}". Only letters, numbers, and hyphens allowed.`)
    return new Tag(normalized)
  }

  equals(other: Tag): boolean { return this.value === other.value }
}
