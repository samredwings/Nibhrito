import type {
  AssembleInput,
  ContextBundle,
  ContextSlot,
} from './types'
import { rankMemories } from './ranking'
import { triggerLorebook } from './lore-trigger'
import { compactSummary } from './summary'
import { buildBlocksWithBudget, estimateTokens } from './budget'

export function assembleContext(input: AssembleInput): ContextBundle {
  const candidateBlocks: Array<{ slot: ContextSlot; text: string; sourceIds: string[] }> = []

  // 1. Identity
  const identityParts = [
    `Character: ${input.character.name}`,
    input.character.personality ? `Personality: ${input.character.personality}` : '',
    input.character.backstory ? `Backstory: ${input.character.backstory}` : '',
    input.character.voiceStyle ? `Voice: ${input.character.voiceStyle}` : '',
    `Language: ${input.character.language}`,
    `Intensity: ${input.intensity}/10`,
  ].filter(Boolean)

  candidateBlocks.push({
    slot: 'IDENTITY',
    text: identityParts.join('\n'),
    sourceIds: [input.character.id],
  })

  // 2. Scene State
  if (input.sceneState) {
    const sceneParts = [
      `Scene: ${input.sceneState.phase}`,
      input.sceneState.location ? `Location: ${input.sceneState.location}` : '',
      input.sceneState.timeOfDay ? `Time: ${input.sceneState.timeOfDay}` : '',
      `Intensity: ${input.sceneState.intensity}/10`,
      `Present: ${input.sceneState.presentIds.length} character(s)`,
    ].filter(Boolean)

    candidateBlocks.push({
      slot: 'SCENE_STATE',
      text: sceneParts.join('\n'),
      sourceIds: [input.sceneState.id],
    })
  }

  // 3. Session Summary
  if (input.session.summary) {
    candidateBlocks.push({
      slot: 'ROLLING_SUMMARY',
      text: `Session summary: ${input.session.summary}`,
      sourceIds: [input.session.id],
    })
  }

  // 4. Recent Messages (last 12)
  if (input.recentMessages.length > 0) {
    const recentTexts = input.recentMessages
      .map((m) => {
        const prefix = m.participantName ? `${m.participantName}: ` : `${m.role}: `
        return prefix + m.content
      })
      .join('\n')

    candidateBlocks.push({
      slot: 'RECENT_TURNS',
      text: `Recent conversation:\n${recentTexts}`,
      sourceIds: [],
    })
  }

  // 5. Memories (ranked)
  if (input.memories.length > 0) {
    const rankingInputs = input.memories.map((memory) => ({
      memory,
      sessionId: input.session.id,
      characterId: input.character.id,
      query: input.userMessage,
      currentTimestamp: new Date(),
    }))

    const ranked = rankMemories(rankingInputs, 8)
    if (ranked.length > 0) {
      const memoryTexts = ranked
        .map((r) => `[${r.memory.type}] ${r.memory.content}`)
        .join('\n')

      candidateBlocks.push({
        slot: 'MEMORIES',
        text: `Relevant memories:\n${memoryTexts}`,
        sourceIds: ranked.map((r) => r.memory.id),
      })
    }
  }

  // 6. Lorebook (triggered)
  if (input.loreEntries.length > 0) {
    const triggered = triggerLorebook(input.loreEntries, input.userMessage, 5)
    if (triggered.length > 0) {
      const loreTexts = triggered
        .map((t) => `[${t.matchedKeywords.join(', ')}] ${t.entry.content}`)
        .join('\n')

      candidateBlocks.push({
        slot: 'LOREBOOK',
        text: `World knowledge:\n${loreTexts}`,
        sourceIds: triggered.map((t) => t.entry.id),
      })
    }
  }

  // 7. Corpus Chunks
  if (input.corpusChunks.length > 0) {
    const corpusTexts = input.corpusChunks
      .map((c) => c.content)
      .join('\n\n')

    candidateBlocks.push({
      slot: 'CORPUS',
      text: `Story context:\n${corpusTexts}`,
      sourceIds: input.corpusChunks.map((c) => c.id),
    })
  }

  // 8. User Message
  candidateBlocks.push({
    slot: 'USER_MESSAGE',
    text: `User: ${input.userMessage}`,
    sourceIds: [],
  })

  // Build with budget
  const { blocks, dropped, remaining } = buildBlocksWithBudget(
    candidateBlocks,
    input.tokenBudget
  )

  return {
    blocks,
    totalTokens: blocks.reduce((sum, b) => sum + b.tokens, 0),
    dropped,
  }
}