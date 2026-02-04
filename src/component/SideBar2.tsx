import { NavLink, useNavigate } from "react-router-dom";

import { useState } from "react";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import {
  FaBars,
  FaHome,
  FaUserGraduate,
  FaBookOpen,
  FaSignOutAlt,
  FaChalkboardTeacher,
  FaBuilding,
  FaMoneyBillWave,
  FaBoxOpen,
  FaUsers,
} from "react-icons/fa";

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

const menuItems: SidebarItem[] = [
  {
    label: "Inicio",
    path: "/panel/home",
    icon: <FaHome />,
    roles: ["Administrador"],
  },
  {
    label: "Alumnos",
    path: "/panel/alumnos",
    icon: <FaUserGraduate />,
    roles: ["Administrador", "Auxiliar"],
  },
  {
    label: "Pagos",
    path: "/panel/pagos",
    icon: <FaMoneyBillWave />,
    roles: ["Administrador", "Auxiliar"],
  },
  {
    label: "Cursos",
    path: "/panel/cursos",
    icon: <FaBookOpen />,
    roles: ["Administrador"],
  },
  {
    label: "Profesores",
    path: "/panel/profesores",
    icon: <FaChalkboardTeacher />,
    roles: ["Administrador"],
  },
  {
    label: "Paquetes",
    path: "/panel/paquetes",
    icon: <FaBoxOpen />,
    roles: ["Administrador"],
  },
  {
    label: "Sucursales",
    path: "/panel/sucursales",
    icon: <FaBuilding />,
    roles: ["Administrador"],
  },
  {
    label: "Usuarios",
    path: "/panel/usuarios",
    icon: <FaUsers />,
    roles: ["Administrador"],
  },
];

const Sidebar2 = () => {
  const [collapsed, setCollapsed] = useState(false);
  const rol = localStorage.getItem("rol");
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };
  return (
    <>
      {/* BOTÓN MOBILE */}
      <button
        className="btn btn-dark d-md-none position-fixed top-0 start-0 m-2 z-3"
        data-bs-toggle="offcanvas"
        data-bs-target="#sidebarMobile"
      >
        <FaBars />
      </button>

      {/* SIDEBAR DESKTOP */}
      <aside
        className={`d-none d-md-flex flex-column bg-dark text-white min-vh-100 p-3${
          collapsed ? "sidebar-collapsed" : "sidebar-expanded"
        }`}
        style={{
          transition: "width 0.3s",
          width: collapsed ? "70px" : "150px",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button
            className="btn btn-outline-light btn-sm"
            onClick={() => setCollapsed(!collapsed)}
          >
            <FaBars />
          </button>
        </div>

        <ul className="nav nav-pills flex-column gap-3">
          {menuItems
            .filter((item) => item.roles.includes(rol!))
            .map((item) => (
              <li key={item.path} className="nav-item">
                <NavLink
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `nav-link text-white d-flex align-items-center gap-2 ${
                      isActive ? "active bg-secondary" : ""
                    }`
                  }
                >
                  {item.icon}
                  {!collapsed && item.label}
                </NavLink>
              </li>
            ))}
        </ul>
        <div className="mt-auto pt-2 pb-1">
          <button
            onClick={logout}
            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
            style={{ color: "white" }}
          >
            <FaSignOutAlt />
            {!collapsed && "Cerrar sesión"}
          </button>
        </div>
      </aside>

      {/* SIDEBAR MOBILE */}
      <div
        className="offcanvas offcanvas-start bg-dark text-white"
        id="sidebarMobile"
      >
        <div className="offcanvas-header">
          <h5>Rebelión DC</h5>
          <button
            className="btn-close btn-close-white"
            data-bs-dismiss="offcanvas"
          ></button>
        </div>

        <div className="offcanvas-body">
          <ul className="nav nav-pills flex-column gap-2">
            {menuItems
              .filter((item) => item.roles.includes(rol!))
              .map((item) => (
                <li key={item.path} className="nav-item">
                  <NavLink
                    to={item.path}
                    className="nav-link text-white d-flex align-items-center gap-2"
                    onClick={() => {
                      const offcanvas =
                        document.getElementById("sidebarMobile");
                      if (!offcanvas) return;

                      const bsOffcanvas = (
                        window as any
                      ).bootstrap.Offcanvas.getOrCreateInstance(offcanvas);
                      bsOffcanvas.hide();
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                </li>
              ))}
          </ul>
          <div className="mt-4 border-top pt-3">
            <button
              onClick={logout}
              className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2"
            >
              <FaSignOutAlt />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar2;
