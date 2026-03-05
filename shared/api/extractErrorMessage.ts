export const extractErrorMessage = (err: unknown) => {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string; error?: string } } }).response
    return response?.data?.message || response?.data?.error || null
  }
  return null
}
