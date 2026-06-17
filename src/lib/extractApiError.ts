type ApiError = {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
};

export function extractApiError(err: unknown, fallback: string): string {
  const data = (err as ApiError)?.response?.data;
  if (data?.message) return data.message;
  return fallback;
}

export function extractFieldErrors(err: unknown): Record<string, string[]> | null {
  const errors = (err as ApiError)?.response?.data?.errors;
  return errors ?? null;
}
