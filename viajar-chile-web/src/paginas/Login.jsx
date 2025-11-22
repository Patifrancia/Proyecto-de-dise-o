import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Completa correo y contraseña.");
      return;
    }

    try {
      setLoading(true);

      // El backend espera { correo, password }
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Intenta mostrar mensaje del backend si viene
        const msg = data?.error || data?.msg || "Credenciales inválidas.";
        throw new Error(msg);
      }

      // Guarda token y usuario
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Si “Recordarme” está desmarcado, puedes limpiar al salir de la pestaña (opcional)
      if (!form.remember) {
        window.addEventListener("beforeunload", () => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }, { once: true });
      }

      // Navega al home (o a donde quieras)
      navigate("/");
    } catch (err) {
      setError(err.message || "Error de autenticación.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleCallback(response) {
    try {
      setLoading(true);
      setError("");

      // Enviar el token de Google al backend
      const res = await fetch(`${API_URL}/api/auth/google/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Error al autenticar con Google");
      }

      // Guarda token y usuario
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Navega al home
      navigate("/");
    } catch (err) {
      setError(err.message || "Error al autenticar con Google.");
      setLoading(false);
    }
  }

  function loadGoogleScript() {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  useEffect(() => {
    if (GOOGLE_CLIENT_ID) {
      loadGoogleScript().then(() => {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          { 
            theme: "outline", 
            size: "large", 
            width: "100%",
            text: "signin_with"
          }
        );
      }).catch(() => {
        // Silenciar error si no se puede cargar
      });
    }
  }, []);

  return (
    <div className="min-h-dvh grid place-items-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h1 className="text-2xl font-bold">Iniciar sesión</h1>
        <p className="text-sm text-gray-600 mt-1">Accede para continuar.</p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Botón de Google */}
        {GOOGLE_CLIENT_ID && (
          <div className="mt-6">
            <div id="google-signin-button" className="w-full"></div>
          </div>
        )}

        {GOOGLE_CLIENT_ID && (
          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-sm text-gray-500">o</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="ejemplo@correo.com"
              autoComplete="email"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <div className="mt-1 relative">
              <input
                type={show ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 pr-12 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                tabIndex={-1}
              >
                {show ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={onChange}
                className="h-4 w-4 rounded border-gray-300"
                disabled={loading}
              />
              Recordarme
            </label>
            <button
              type="button"
              onClick={() => alert("Recuperar contraseña (pendiente)")}
              className="text-sm hover:underline"
              disabled={loading}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-white font-medium hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿No tienes cuenta?{" "}
          <Link to="/registro" className="font-medium hover:underline">
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
