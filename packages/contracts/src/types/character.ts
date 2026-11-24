export interface Character {
  id: string
  name: string
  age?: number | null
  gender?: string | null
  personality?: string | null
  backstory?: string | null
  voiceStyle?: string | null
  language: string
  isTemplate: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CharacterCreateInput {
  name: string
  age?: number
  gender?: string
  personality?: string
  backstory?: string
  voiceStyle?: string
  language?: string
  isTemplate?: boolean
}

export interface CharacterUpdateInput {
  name?: string
  age?: number
  gender?: string
  personality?: string
  backstory?: string
  voiceStyle?: string
  language?: string
  isTemplate?: boolean
}

export interface VisualProfile {
  id: string
  characterId: string
  referenceUrl?: string | null
  portraitUrl?: string | null
  notes?: string | null
}