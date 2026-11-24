import { describe, expect, it } from 'vitest'
import { CharacterCreateSchema, SessionCreateSchema } from '../schemas'

describe('contract schemas', () => {
  it('rejects a character age below the adult minimum', () => {
    expect(() => CharacterCreateSchema.parse({ name: 'Mira', age: 17 })).toThrow()
  })

  it('accepts a supported character-first session', () => {
    expect(SessionCreateSchema.parse({ title: 'A story', mode: 'CHARACTER_FIRST' })).toMatchObject({
      title: 'A story', mode: 'CHARACTER_FIRST', language: 'en',
    })
  })
})
