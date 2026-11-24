import { Router } from 'express'
import characters from './characters'
import sessions from './sessions'
import messages from './messages'
import providers from './providers'

const router: Router = Router()

router.use('/characters', characters)
router.use('/sessions', sessions)
router.use('/messages', messages)
router.use('/providers', providers)

export default router