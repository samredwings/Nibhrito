export type ScenePhase = 'INTRO' | 'BUILD' | 'INTIMATE' | 'CLIMAX' | 'AFTERCARE'

export interface SceneState {
  id: string
  sessionId: string
  location?: string | null
  timeOfDay?: string | null
  phase: ScenePhase
  intensity: number
  presentIds: string[]
}

export interface SceneStateInput {
  location?: string
  timeOfDay?: string
  phase?: ScenePhase
  intensity?: number
  presentIds?: string[]
}