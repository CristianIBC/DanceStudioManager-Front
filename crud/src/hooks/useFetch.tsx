import api from "./api";
import { useEffect, useState } from "react";
import { showLoading, closeLoading } from "../hooks/alerts/LoadingAlert";
import { showError } from "./alerts/ErrorAlert";
function useFetch<T>(url: string, enabled: boolean = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    showLoading();
    const load = async () => {
      try {
        const resp = await api.get<T>(url);
        setData(resp.data);
        closeLoading();
      } catch (e: any) {
        closeLoading();

        if (e.response?.status !== 401 && e.response?.status !== 403) {
          showError({ message: e.message });
        }

        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [url, enabled]);

  return { data, loading, error };
}
export default useFetch;
