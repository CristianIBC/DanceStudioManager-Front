// hooks/useDelete.ts
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


  const deleteRecord = async (
    id: number | undefined,
    cursoId?: number | undefined
  ) => {
    showLoading("Borrando...");
    let url = cursoId ? `${endpoint}/${id}/${cursoId}` : `${endpoint}/${id}`;
    const ok = await api.delete(url);
    if (ok.data) {
      if (onSuccess) {
        await onSuccess();
      }
      closeLoading();
      return { success: true, error: null };
    } else {
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
