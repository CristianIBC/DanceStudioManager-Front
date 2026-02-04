// hooks/useDelete.ts
import { useState } from "react";
import api from "./api";
import { showLoading, closeLoading } from "../hooks/alerts/LoadingAlert";

interface UseDeleteOptions {
  endpoint: string;
  onSuccess?: () => void | Promise<void>;
  onError?: (error: string) => void;
}

export const useDelete = ({
  endpoint,
  onSuccess,
  onError,
}: UseDeleteOptions) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteRecord = async (
    id: number | undefined,
    cursoId?: number | undefined
  ) => {
    setIsDeleting(true);
    showLoading("Borrando...");
    setError(null);
    let url = cursoId ? `${endpoint}/${id}/${cursoId}` : `${endpoint}/${id}`;
    const ok = await api.delete(url);
    if (ok.data) {
      if (onSuccess) {
        await onSuccess();
      }
      closeLoading();
      return { success: true, error: null };
    } else {
      setError("Error al eliminar registro");
      if (onError) {
        onError("Error al eliminar registro");
      }
      closeLoading();
      return { success: false, error: "Error al eliminar registro" };
    }
  };

  return {
    deleteRecord,
  };
};
