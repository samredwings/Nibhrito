import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router: Router = Router()

// GET /api/auth/status is intentionally public and reveals no credential material.
router.get('/status', async (_req, res) => {
  try {
    const profile = await prisma.localProfile.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    })
    res.json({
      data: {
        configured: Boolean(profile),
        required: process.env.NODE_ENV === 'production',
      },
    })
  } catch (error) {
    console.error('Failed to read local authentication status:', error)
    res.status(503).json({ error: 'AUTH_UNAVAILABLE', message: 'Could not read local authentication status.' })
  }
})

export default router
