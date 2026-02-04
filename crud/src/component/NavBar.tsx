import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo-rebelion.png";
import { FaSignOutAlt } from "react-icons/fa";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid d-flex align-items-center">
        {/* Logo */}
        <Link className="navbar-brand d-none d-md-block" to="/panel/home">
          Rebelión DC
        </Link>

        {/* Usuario */}
        <div className="dropdown ms-auto text-end">
          <button
            className="btn d-flex align-items-center text-white dropdown-toggle"
            data-bs-toggle="dropdown"
          >
            <img
              src={logo}
              alt="Foto de perfil"
              className="rounded-circle me-2"
              style={{ width: "32px", height: "32px" }}
            />
            <strong className="text-truncate" style={{ maxWidth: "120px" }}>
              {localStorage.getItem("nombre")}
            </strong>
          </button>

          <ul className="dropdown-menu dropdown-menu-dark text-small shadow dropdown-menu-end">
            <li>
              <button className="dropdown-item" onClick={logout}>
                <FaSignOutAlt className="me-2" />
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
