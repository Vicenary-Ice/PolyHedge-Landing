import { useState } from 'react';

export function useEmailSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const signup = async (email: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to sign up');
        return false;
      }

      setSuccess(true);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error, success };
}
