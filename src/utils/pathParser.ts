import { truthy } from './truthy'
import _ from 'lodash'

export type HandlerAction = {
  handlerName: string
  subsegments: string[]
}

export const pathParser = (path: string): HandlerAction => {
  const segments = path.split('/').filter(truthy)
  const versionIndex = segments.indexOf('v1')

  const handlerName = _.get(segments, [versionIndex + 1], '')
  const subsegments = _.slice(segments, versionIndex + 2)

  return {
    handlerName,
    subsegments,
  }
}
