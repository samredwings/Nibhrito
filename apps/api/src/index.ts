import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import routes from './routes'
import { errorHandler } from './middleware/error'

dotenv.config()

const app: express.Express = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: process.env.APP_VERSION || '0.1.0' })
})

// API routes
app.use('/api', routes)

// Error handler
app.use(errorHandler)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'NOT_FOUND', message: 'Endpoint not found' })
})

app.listen(PORT, () => {
  console.log(`Nibhrito API server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Provider: ${process.env.OLLAMA_URL || 'fake (dev)'}`)
})

export default app