import { Router } from 'express'
import auth from './auth'
import characters from './characters'
import sessions from './sessions'
import messages from './messages'
import providers from './providers'
import memories from './memories'
import lorebook from './lorebook'

const router: Router = Router()

router.use('/auth', auth)
router.use('/characters', characters)
router.use('/sessions', sessions)
router.use('/messages', messages)
router.use('/providers', providers)
router.use('/memories', memories)
router.use('/lorebook', lorebook)

export default router
