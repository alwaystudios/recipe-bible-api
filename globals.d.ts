declare type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> }

declare type APIResponse = {
  statusCode: number
  body: string
  headers?: {
    [header: string]: boolean | number | string
  }
}
