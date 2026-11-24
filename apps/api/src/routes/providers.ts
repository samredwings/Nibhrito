import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { ports } from '../lib/ports'

const router: Router = Router()

// GET /api/providers
router.get('/', async (_req, res) => {
  try {
    const configs = await prisma.providerConfig.findMany({ orderBy: { name: 'asc' } })

    // Add the active provider info
    const health = await ports.provider.health().catch(() => ({
      status: 'unavailable' as const,
      reason: 'Health check failed',
    }))

    res.json({
      data: {
        configs,
        active: {
          id: ports.provider.id,
          name: ports.provider.name,
          capabilities: ports.provider.capabilities(),
          health,
        },
      },
    })
  } catch (err) {
    console.error('Failed to fetch providers:', err)
    res.status(500).json({ error: 'FETCH_FAILED', message: 'Could not fetch providers' })
  }
})

// GET /api/providers/health
router.get('/health', async (_req, res) => {
  try {
    const health = await ports.provider.health()
    res.json({ data: health })
  } catch (err) {
    res.status(503).json({
      error: 'HEALTH_CHECK_FAILED',
      message: err instanceof Error ? err.message : 'Unknown error',
    })
  }
})

export default router