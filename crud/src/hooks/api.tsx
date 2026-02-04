import axios from "axios";
import { URL } from "../constants/url";
import Swal from "sweetalert2";

const api = axios.create({
  baseURL: URL.HOST,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 👇 AQUÍ se manejan los 403 / 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      Swal.fire({
        title: "Sesión expirada",
        text: "Vuelve a iniciar sesión",
        icon: "warning",
        confirmButtonText: "Aceptar",
        allowOutsideClick: false,
        allowEscapeKey: false,
      }).then(() => {
        localStorage.clear();
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      });

      // 🔴 IMPORTANTE: DETENER la cadena aquí
      return new Promise(() => {});
    }

    return Promise.reject(error);
  }
);

export default api;
