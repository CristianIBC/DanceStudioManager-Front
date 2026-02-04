import DashboardCards from "../component/DashboardCards";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import logo from "../assets/logo-rebelion-home.png";
const Inicio = () => {
  const location = useLocation();
  let morosos = location.pathname.includes("/morosos");
  let ingresos = location.pathname.includes("/ingresos");
  let sucursal = location.pathname.includes("/reporte-sucursal");
  let recientes = location.pathname.includes("/recientes-borrados");
  const admin = localStorage.getItem("rol") == "Administrador" ? true : false;
  return (
    <>
      <h2 className="mb-1 d-flex align-items-center gap-2">
        {(morosos || ingresos || sucursal || recientes) && (
          <NavLink to="/panel/home" className="text-dark">
            <i className="bi bi-arrow-left"></i>
          </NavLink>
        )}
        Inicio
      </h2>{" "}
      {!morosos && !ingresos && !sucursal && !recientes && (
        <>
          {admin && <DashboardCards />}
          <div className="d-flex justify-content-center align-items-center mt-5">
            <img
              src={logo}
              alt="Logo"
              className="logo-pulse"
              style={{ width: "310px", height: "300px" }}
            />
          </div>

          <div className="text-center mt-3">
            <h5>Rebelion DC</h5>
          </div>
        </>
      )}
      <div className="flex-grow-1 p-4 bg-light overflow-hidden">
        <Outlet></Outlet>
      </div>
    </>
  );
};

export default Inicio;
