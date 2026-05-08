import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Panel from "./pages/Panel";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Alumnos from "./pages/Alumnos";
import Cursos from "./pages/Cursos";
import Profesores from "./pages/Profesores";
import Sucursales from "./pages/Sucursales";
import Pagos from "./pages/Pagos";
import Paquetes from "./pages/Paquetes";
import AlumnosMorosos from "./pages/reports/AlumnosMorosos";
import ReporteIngresos from "./pages/reports/ReporteIngresos";
import ReporteSucursal from "./pages/reports/ReporteSucursal";
import AlumnosRecientesBorrados from "./pages/reports/AlumnosRecientesBorrados";
import ProtectedRoute from "./component/ProtectedRoute";
import Usuarios from "./pages/Usuarios";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Panel con layout */}
        <Route
          path="/panel"
          element={
            <ProtectedRoute allowedRoles={["Administrador", "Auxiliar"]}>
              <Panel />
            </ProtectedRoute>
          }
        >
          <Route
            path="home"
            element={
              <ProtectedRoute allowedRoles={["Administrador", "Auxiliar"]}>
                <Home />
              </ProtectedRoute>
            }
          >
            <Route path="morosos" element={<AlumnosMorosos />} />
            <Route path="ingresos" element={<ReporteIngresos />} />
            <Route path="reporte-sucursal" element={<ReporteSucursal />} />
            <Route
              path="recientes-borrados"
              element={<AlumnosRecientesBorrados />}
            />
          </Route>

          <Route
            path="alumnos"
            element={
              <ProtectedRoute allowedRoles={["Administrador", "Auxiliar"]}>
                <Alumnos />
              </ProtectedRoute>
            }
          />
          <Route
            path="cursos"
            element={
              <ProtectedRoute allowedRoles={["Administrador"]}>
                <Cursos />
              </ProtectedRoute>
            }
          />
          <Route
            path="profesores"
            element={
              <ProtectedRoute allowedRoles={["Administrador"]}>
                <Profesores />
              </ProtectedRoute>
            }
          />
          <Route
            path="sucursales"
            element={
              <ProtectedRoute allowedRoles={["Administrador"]}>
                <Sucursales />
              </ProtectedRoute>
            }
          />
          <Route
            path="pagos"
            element={
              <ProtectedRoute allowedRoles={["Administrador", "Auxiliar"]}>
                <Pagos />
              </ProtectedRoute>
            }
          />
          <Route
            path="paquetes"
            element={
              <ProtectedRoute allowedRoles={["Administrador"]}>
                <Paquetes />
              </ProtectedRoute>
            }
          />
          <Route
            path="usuarios"
            element={
              <ProtectedRoute allowedRoles={["Administrador"]}>
                <Usuarios />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
