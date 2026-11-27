import { describe, expect, it } from 'vitest'
import { CharacterCreateSchema, SessionCreateSchema } from '../schemas'

describe('contract schemas', () => {
  it('rejects a character age below the adult minimum', () => {
    expect(() => CharacterCreateSchema.parse({ name: 'Mira', age: 17 })).toThrow()
  })

  it('accepts a supported character-first session', () => {
    expect(SessionCreateSchema.parse({
      title: 'A story',
      mode: 'CHARACTER_FIRST',
      characterIds: ['00000000-0000-4000-8000-000000000001'],
    })).toMatchObject({
      title: 'A story', mode: 'CHARACTER_FIRST', language: 'en',
      characterIds: ['00000000-0000-4000-8000-000000000001'],
    })
  })
})
