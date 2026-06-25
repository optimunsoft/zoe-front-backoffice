function getHttpStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined
  }

  const record = error as {
    status?: number
    statusCode?: number
    response?: { status?: number }
  }

  return record.response?.status ?? record.status ?? record.statusCode
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string' && error.trim()) {
    return error
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  if (typeof error === 'object' && error !== null) {
    const record = error as {
      message?: string
      data?: { message?: string }
      response?: { _data?: { message?: string } }
    }

    const apiMessage =
      record.data?.message
      ?? record.response?._data?.message
      ?? record.message

    if (typeof apiMessage === 'string' && apiMessage.trim()) {
      return apiMessage
    }

    const status = getHttpStatus(error)
    if (status === 401 || status === 403) {
      return 'No autorizado'
    }
  }

  return fallback
}

export { getHttpStatus }
