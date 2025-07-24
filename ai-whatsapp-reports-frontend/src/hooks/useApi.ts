import { useState, useCallback } from 'react';
import { API_BASE_URL } from '@/constants';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> {
  state: ApiState<T>;
  execute: (url: string, options?: RequestInit) => Promise<T>;
  reset: () => void;
}

export const useApi = <T = unknown>(): UseApiReturn<T> => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (url: string, options?: RequestInit): Promise<T> => {
    setState({ data: null, loading: true, error: null });

    try {
      const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
      
      const response = await fetch(fullUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { state, execute, reset };
};
