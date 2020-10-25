import { NextFunction, Request, Response, RequestHandler } from 'express'

export const fakeCheckJwt: RequestHandler = (req: Request, res: Response, next: NextFunction) =>
  next()
