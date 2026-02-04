import { Outlet } from "react-router-dom";
import NavBar from "../component/NavBar";
import Sidebar2 from "../component/SideBar2";
import Swal from "sweetalert2";
import { useEffect } from "react";
import api from "../hooks/api";
import { URL } from "../constants/url";
import { showInfo } from "../hooks/alerts/InfoAlert";

export default function Panel() {
  useEffect(() => {
    const exp = localStorage.getItem("tokenExp");
    if (!exp) return;

    const tiempoRestante = Number(exp) - Date.now();

    if (tiempoRestante <= 0) {
      cerrarSesion();
    } else {
      setTimeout(cerrarSesion, tiempoRestante);
    }
  }, []);
  useEffect(() => {
    const initSucursal = async () => {
      if (!localStorage.getItem("sucursalId")) {
        const { data } = await api.get(URL.HOST + "/sucursales/default");
        localStorage.setItem("sucursalId", data);
        if (data == 0) {
          showInfo({
            title: "IMPORTANTE",
            message:
              "No hay ninguna sucursal, un administrador debe crear al menos una",
          });
        }
      }
    };

    initSucursal();
  }, []);

  function cerrarSesion() {
    Swal.fire({
      title: "Sesión expirada",
      text: "Tu sesión ha terminado",
      icon: "warning",
      confirmButtonText: "Aceptar",
    }).then(() => {
      localStorage.clear();
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    });
  }
  return (
    <div className="d-flex min-vh-100">
      {/* SIDEBAR IZQUIERDA */}
      <Sidebar2 />

      {/* CONTENIDO DERECHO */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* NAVBAR ARRIBA */}
        <NavBar />

        {/* CONTENIDO */}
        <main className="flex-grow-1 p-4 bg-light">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
