import Swal from "sweetalert2";

export const showLoading = (text = "Cargando...") => {
  Swal.fire({
    title: "Por favor espera",
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

export const closeLoading = () => {
  Swal.close();
};
