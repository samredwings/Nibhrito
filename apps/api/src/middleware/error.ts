import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: err.errors,
    })
    return
  }

  console.error('Unhandled error:', err)
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  })
}