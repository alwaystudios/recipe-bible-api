import { SystemStatus } from '../src/system/systemRepository'

export const testSystemStatus = (): SystemStatus => [
  { setting: 'setting 1', value: 'one' },
  { setting: 'setting 2', value: 'two' },
  { setting: 'setting 3', value: 'three' },
]

export const testSystemStatusRecord = () => [
  { setting: 'setting 1', setting_value: 'one' },
  { setting: 'setting 2', setting_value: 'two' },
  { setting: 'setting 3', setting_value: 'three' },
]
