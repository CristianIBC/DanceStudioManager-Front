// hooks/useDeleteConfirm.ts
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface DeleteConfirmProps {
  title?: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: string;
}

export const DeleteAlert = () => {
  const confirmDelete = async ({
    title = "¿Estás seguro?",
    text = "Esta acción no se puede deshacer",
    confirmButtonText = "Sí, eliminar",
    cancelButtonText = "Cancelar",
    confirmButtonColor = "#d33",
  }: DeleteConfirmProps = {}) => {
    const result = await MySwal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor,
      cancelButtonColor: "#3085d6",
      confirmButtonText,
      cancelButtonText,
    });

    return result.isConfirmed;
  };

  return { confirmDelete };
};
