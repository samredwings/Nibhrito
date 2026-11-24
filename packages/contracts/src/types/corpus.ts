export interface CorpusDocument {
  id: string
  title: string
  content: string
  language: string
  tags: string[]
  createdAt: Date
}

export interface CorpusChunk {
  id: string
  documentId: string
  content: string
  index: number
  metadata: Record<string, unknown>
}

export interface CorpusSearchResult {
  chunk: CorpusChunk
  score: number
}