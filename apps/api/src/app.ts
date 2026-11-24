import express, { type Express } from 'express'
import cors from 'cors'
import routes from './routes'
import { errorHandler } from './middleware/error'
import { localAuth } from './middleware/auth'

export function createApp(): Express {
  const app: Express = express()
  app.use(cors())
  app.use(express.json({ limit: '10mb' }))

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', version: process.env.APP_VERSION || '0.1.0' })
  })

  app.use('/api', localAuth)
  app.use('/api', routes)
  app.use(errorHandler)
  app.use((_req, res) => {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Endpoint not found' })
  })

  return app
}
