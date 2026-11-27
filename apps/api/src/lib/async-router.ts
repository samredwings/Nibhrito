import { Router, type RequestHandler } from 'express'

/**
 * Express 4 does not forward rejected promises to the error middleware, so an
 * async handler that throws leaves the client waiting until it times out.
 */
export function asyncRouter(): Router {
  const router = Router()
  const wrap = (handler: RequestHandler): RequestHandler => (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next)

  for (const method of ['get', 'post', 'patch', 'delete', 'put'] as const) {
    const original = router[method].bind(router)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router[method] = ((path: any, ...handlers: any[]) =>
      original(path, ...handlers.map(wrap))) as typeof router[typeof method]
  }
  return router
}
