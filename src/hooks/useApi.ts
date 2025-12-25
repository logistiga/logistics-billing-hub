import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import type { ApiError } from "@/services/api/types";

interface UseApiOptions {
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

interface UseApiResult<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook générique pour les appels API avec gestion du loading et des erreurs
 */
export function useApi<T>(
  apiFunction: (...args: unknown[]) => Promise<T>,
  options: UseApiOptions = {}
): UseApiResult<T> {
  const { showErrorToast = true, showSuccessToast = false, successMessage } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...args);
        setData(result);

        if (showSuccessToast && successMessage) {
          toast({
            title: "Succès",
            description: successMessage,
          });
        }

        return result;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError);

        if (showErrorToast) {
          toast({
            title: "Erreur",
            description: apiError.message || "Une erreur est survenue",
            variant: "destructive",
          });
        }

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction, showErrorToast, showSuccessToast, successMessage]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { data, isLoading, error, execute, reset };
}

/**
 * Hook pour les mutations (create, update, delete)
 */
export function useMutation<T, TArgs extends unknown[]>(
  mutationFn: (...args: TArgs) => Promise<T>,
  options: UseApiOptions & { onSuccess?: (data: T) => void } = {}
) {
  const { onSuccess, ...apiOptions } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(
    async (...args: TArgs): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await mutationFn(...args);

        if (apiOptions.showSuccessToast && apiOptions.successMessage) {
          toast({
            title: "Succès",
            description: apiOptions.successMessage,
          });
        }

        onSuccess?.(result);
        return result;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError);

        if (apiOptions.showErrorToast !== false) {
          toast({
            title: "Erreur",
            description: apiError.message || "Une erreur est survenue",
            variant: "destructive",
          });
        }

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, apiOptions, onSuccess]
  );

  return { mutate, isLoading, error };
}
