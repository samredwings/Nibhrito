import { describe, expect, it } from 'vitest'
import {
  CharacterCreateSchema,
  ParticipantCreateSchema,
  SessionCreateSchema,
} from '../schemas'

const characterId = '00000000-0000-4000-8000-000000000001'

describe('contract schemas', () => {
  it('rejects a character age below the adult minimum', () => {
    expect(() => CharacterCreateSchema.parse({ name: 'Mira', age: 17 })).toThrow()
  })

  it('accepts a supported character-first session', () => {
    expect(SessionCreateSchema.parse({
      title: 'A story',
      mode: 'CHARACTER_FIRST',
      characterIds: [characterId],
    })).toMatchObject({
      title: 'A story', mode: 'CHARACTER_FIRST', language: 'en',
      characterIds: [characterId],
    })
  })

  it('rejects duplicate character ids in a session cast', () => {
    expect(() => SessionCreateSchema.parse({
      title: 'A story',
      mode: 'CHARACTER_FIRST',
      characterIds: [characterId, characterId],
    })).toThrow()
  })

  it('trims participant display names and rejects whitespace-only names', () => {
    expect(ParticipantCreateSchema.parse({
      characterId,
      displayName: '  Mira  ',
    }).displayName).toBe('Mira')

    expect(() => ParticipantCreateSchema.parse({
      characterId,
      displayName: '   ',
    })).toThrow()
  })
})
