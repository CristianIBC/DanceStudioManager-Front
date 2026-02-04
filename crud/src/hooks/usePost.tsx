import { useState } from "react";
import api from "./api";
import { AxiosError } from "axios";
import { showLoading, closeLoading } from "../hooks/alerts/LoadingAlert";

interface UsePostResult<T> {
  post: (body: T, id?: number) => Promise<any>;
  loading: boolean;
  error: string | null;
  data: any;
}

export function usePost<T>(url: string): UsePostResult<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const post = async (body: T, id?: number) => {
    setLoading(true);
    showLoading();
    setError(null);

    try {
      if (id != undefined) {
        url = url + `/${id}`;
      }

      const response = await api.post(
        url,
        body,
        id != undefined
          ? {
              headers: {
                "Content-Type": "text/plain",
              },
            }
          : undefined
      );

      setData(response.data);
      closeLoading();
      return response.data;
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.data?.message || err.message
          : "Error desconocido";
      setError(errorMessage);
      closeLoading();
      return {};
    } finally {
      setLoading(false);
      closeLoading();
    }
  };

  return { post, loading, error, data };
}
