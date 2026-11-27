import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { verifyLocalPin } from '../lib/pin'

const FAILURE_WINDOW_MS = 5 * 60 * 1000
const LOCKOUT_MS = 5 * 60 * 1000
const MAX_FAILURES = 8

type FailureState = { count: number; windowStartedAt: number; blockedUntil: number }
const failuresByAddress = new Map<string, FailureState>()

function recordFailure(address: string, now: number): FailureState {
  const previous = failuresByAddress.get(address)
  const state = !previous || now - previous.windowStartedAt > FAILURE_WINDOW_MS
    ? { count: 1, windowStartedAt: now, blockedUntil: 0 }
    : { ...previous, count: previous.count + 1 }

  if (state.count >= MAX_FAILURES) {
    state.blockedUntil = now + LOCKOUT_MS
    state.count = 0
    state.windowStartedAt = now
  }
  failuresByAddress.set(address, state)
  return state
}

export async function localAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  // The app needs this one read-only endpoint to determine whether PIN setup is required.
  if (req.method === 'GET' && req.path === '/auth/status') {
    next()
    return
  }

  // Development remains frictionless. Production never accepts a header merely because it exists.
  if (process.env.NODE_ENV !== 'production') {
    next()
    return
  }

  const address = req.ip || req.socket.remoteAddress || 'unknown'
  const now = Date.now()
  const failureState = failuresByAddress.get(address)
  if (failureState && failureState.blockedUntil > now) {
    res.status(429).json({ error: 'RATE_LIMITED', message: 'Too many incorrect PIN attempts. Try again later.' })
    return
  }

  const suppliedPin = req.header('x-local-pin')
  if (!suppliedPin) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'PIN required' })
    return
  }

  try {
    const profile = await prisma.localProfile.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { pinHash: true },
    })

    if (!profile) {
      res.status(503).json({
        error: 'AUTH_NOT_CONFIGURED',
        message: 'Set the local PIN on the API host before using the production API.',
      })
      return
    }

    if (!verifyLocalPin(suppliedPin, profile.pinHash)) {
      const updated = recordFailure(address, now)
      if (updated.blockedUntil > now) {
        res.status(429).json({ error: 'RATE_LIMITED', message: 'Too many incorrect PIN attempts. Try again later.' })
        return
      }
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'Incorrect PIN' })
      return
    }

    failuresByAddress.delete(address)
    next()
  } catch (error) {
    console.error('Local PIN verification failed:', error)
    res.status(503).json({ error: 'AUTH_UNAVAILABLE', message: 'PIN verification is temporarily unavailable.' })
  }
}
