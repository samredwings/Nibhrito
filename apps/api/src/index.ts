import dotenv from 'dotenv'
import { createApp } from './app'

dotenv.config()

const app = createApp()
const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Nibhrito API server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Provider: ${process.env.OLLAMA_URL || 'fake (dev)'}`)
})

export { app }
export default app
