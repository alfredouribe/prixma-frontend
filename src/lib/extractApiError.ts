export function extractApiError(err: unknown, fallback: string): string {
  const response = (err as { response?: { data?: { message?: string } } })?.response;
  if (response?.data?.message) {
    return response.data.message;
  }
  return fallback;
}
