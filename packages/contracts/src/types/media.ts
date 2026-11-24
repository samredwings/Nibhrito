export interface MediaAsset {
  id: string
  filename: string
  mimeType: string
  size: number
  url: string
  sessionId?: string | null
  characterId?: string | null
  createdAt: Date
}

export interface GenerationJob {
  id: string
  type: 'IMAGE' | 'AUDIO' | 'VIDEO' | 'CORPUS'
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  progress: number
  resultUrl?: string | null
  error?: string | null
  createdAt: Date
  updatedAt: Date
}