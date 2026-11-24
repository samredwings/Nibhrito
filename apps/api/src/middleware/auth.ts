import type { Request, Response, NextFunction } from 'express'

// Simple single-user auth — PIN verified at app level
export function localAuth(req: Request, res: Response, next: NextFunction): void {
  // For now, allow all requests in development
  // In production, verify PIN from header or session
  const pinHeader = req.headers['x-local-pin']

  if (process.env.NODE_ENV === 'production' && !pinHeader) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'PIN required' })
    return
  }

  next()
}