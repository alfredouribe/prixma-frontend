import { useState } from 'react';
import { authService } from '../services/authService';

export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleForgotPassword(email: string) {
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
    } finally {
      // Per spec: always show success — never reveal if email exists
      setSent(true);
      setIsLoading(false);
    }
  }

  return { handleForgotPassword, isLoading, sent };
}
