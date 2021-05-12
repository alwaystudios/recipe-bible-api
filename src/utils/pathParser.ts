import { truthy } from './truthy'
import { pathOr, slice } from 'ramda'

export type HandlerAction = {
  handlerName: string
  subsegments: string[]
}

export const pathParser = (path: string): HandlerAction => {
  const segments = path.split('/').filter(truthy)
  const versionIndex = segments.indexOf('v1')

  const handlerName = pathOr('', [versionIndex + 1], segments)
  const subsegments = slice(versionIndex + 2, Infinity, segments)

  return {
    handlerName,
    subsegments,
  }
}
