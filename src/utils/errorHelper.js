// utils/errorHelper.js
export function extractErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const validationErrors = error?.response?.data?.errors
  const backendMessage = error?.response?.data?.message

  if (validationErrors) {
    return Object.values(validationErrors).flat().join(' ')
  }
  if (backendMessage) {
    return backendMessage
  }
  return fallback
}