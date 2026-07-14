export type ApiResponse<T> = {
  response: T
  message?: string
  status?: boolean | number
}
