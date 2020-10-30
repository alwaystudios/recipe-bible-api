import { NextFunction, Request, Response, RequestHandler } from 'express'

export const fakeCheckJwt: RequestHandler = (req: Request, res: Response, next: NextFunction) =>
  next()

export const fakeUserMiddleware: RequestHandler = (
  _: Request,
  res: Response,
  next: NextFunction,
) => {
  res.locals.user = { sub: 'test-abc', roles: ['user'] }
  next()
}

export const fakeUserAdminMiddleware: RequestHandler = (
  _: Request,
  res: Response,
  next: NextFunction,
) => {
  res.locals.user = { sub: 'test-xyz', roles: ['admin'] }
  next()
}
