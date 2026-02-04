import type { JSX } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: JSX.Element;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const rol = localStorage.getItem("rol");
  const token = localStorage.getItem("token");

  // Solo bloquear si NO hay token
  if (!token) {
    return <Navigate to="/" />;
  }

  // Si hay token pero no tiene permiso
  if (!rol || !allowedRoles.includes(rol)) {
    return <Navigate to="/panel" />;
  }

  return children;
};

export default ProtectedRoute;
