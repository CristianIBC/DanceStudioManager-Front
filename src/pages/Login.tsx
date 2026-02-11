import { useEffect, useState } from "react";
import { URL } from "../constants/url";
import type { AuthResponse } from "../Interfaces/AuthResponse";
import { showError } from "../hooks/alerts/ErrorAlert";
import { useNavigate } from "react-router-dom";
import api from "../hooks/api";
import "../styles/Login.css";
import Logo from "../assets/logo-rebelion.png";
import { showLoading, closeLoading } from "../hooks/alerts/LoadingAlert";
export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const roleRedirect: Record<string, string> = {
    Administrador: "/panel/home",
    Auxiliar: "/panel/home",
  };
  const submitLoging = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "" || password === "") {
      showError({
        title: "Error",
        message: "Ingresa el usuario y la contraseña",
      });
      return;
    }
    setLoading(true);
    showLoading("Iniciando sesión...");

    try {
      const resp = await api.post(URL.HOST + "/usuarios/login", {
        username,
        password,
      });
      if (resp.status == 200) {
        const authResponse: AuthResponse = resp.data;
        localStorage.setItem("token", authResponse.token);
        localStorage.setItem("rol", authResponse.rol);
        localStorage.setItem("nombre", authResponse.nombre);
        localStorage.setItem("id", String(authResponse.id));
        localStorage.setItem(
          "tokenExp",
          String(Date.now() + 1_000 * 60 * 60 * 24),
        );
        const redirectPath = roleRedirect[authResponse.rol] || "/panel/home";
        navigate(redirectPath);
      }
      closeLoading();
      setLoading(false);
    } catch (e: any) {
      closeLoading();
      showError({
        title: "Ingreso inválido",
        message:
          "La contraseña o el usuario están mal: (" +
          e.response?.status +
          "/" +
          e.response?.data +
          ")",
      });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submitLoging}>
      <div className="login-bg d-flex justify-content-center align-items-center">
        <div
          className="card shadow p-5 login-card animate-login"
          style={{ width: 480, borderRadius: "12px" }}
        >
          {/* LOGO */}
          <div className="text-center mb-3">
            <img src={Logo} alt="Logo" style={{ width: 80 }} />
          </div>

          <h3 className="text-center mb-1 no-text-cursor">Iniciar sesión</h3>
          <h5 className="text-center mb-4 no-text-cursor">Rebelión DC</h5>

          <input
            className="form-control mb-3 no-text-cursor"
            placeholder="Usuario"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            autoComplete="current-password"
            className="form-control mb-4 no-text-cursor"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-login-dark w-100 no-text-cursor"
            style={{ color: "white" }}
          >
            Entrar
          </button>
        </div>
      </div>
    </form>
  );
}
