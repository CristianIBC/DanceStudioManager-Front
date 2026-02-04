import { useState } from "react";
import { AxiosError } from "axios";
import api from "./api";
import { showLoading, closeLoading } from "../hooks/alerts/LoadingAlert";

interface UseUpdateOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useUpdate<TRequest, TResponse = TRequest>(
  endpoint: string,
  options?: UseUpdateOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number | undefined, data: TRequest) => {
    setLoading(true);
    showLoading();
    setError(null);

    try {
      const response = await api.put<TResponse>(`${endpoint}/${id}`, data);

      options?.onSuccess?.();
      closeLoading();
      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError<any>;
      const message =
        axiosError.response?.data?.message ??
        axiosError.message ??
        "Error al actualizar";

      setError(message);
      options?.onError?.(message);
      closeLoading();
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}
