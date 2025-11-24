import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { i18n } from "../i18n";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLang] = useState(i18n.lang);
  const navigate = useNavigate();

  useEffect(() => {
    const onChange = () => setLang(i18n.lang);
    window.addEventListener("langchange", onChange);
    return () => window.removeEventListener("langchange", onChange);
  }, []);

  function t(key, opts) {
    return i18n.t(key, opts);
  }

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError(t("auth.error_missing_fields"));
      return;
    }

    try {
      setLoading(true);

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
        const backendMsg =
          data?.error || data?.msg || t("auth.error_invalid_credentials");
        // Si viene algo tipo "Credenciales inválidas" lo mapeamos al texto i18n
        const lower = String(backendMsg).toLowerCase();
        if (lower.includes("credenciales") || lower.includes("invalid")) {
          throw new Error("AUTH_INVALID_CREDENTIALS");
        }
        throw new Error(backendMsg);
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (!form.remember) {
        window.addEventListener(
          "beforeunload",
          () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          },
          { once: true }
        );
      }

      navigate("/");
    } catch (err) {
      if (err.message === "AUTH_INVALID_CREDENTIALS") {
        setError(t("auth.error_invalid_credentials"));
      } else {
        setError(err.message || t("auth.error_generic"));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setLoading(true);
      setError("");

      if (!window.google?.accounts?.id) {
        setError(t("auth.error_google"));
        setLoading(false);
        return;
      }

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          window.google.accounts.id.renderButton(
            document.getElementById("google-signin-fallback"),
            {
              theme: "outline",
              size: "large",
              width: "100%",
              locale: { es: "es_ES", en: "en_US", de: "de_DE" }[i18n.lang] || "es_ES",
            }
          );
        }
      });
    } catch (err) {
      setError(err.message || t("auth.error_google"));
      setLoading(false);
    }
  }

  async function handleGoogleCallback(response) {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/api/auth/google/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || t("auth.error_google"));
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/");
    } catch (err) {
      setError(err.message || t("auth.error_google"));
      setLoading(false);
    }
  }

  function loadGoogleScript() {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts) {
        resolve();
        return;
      }

      // Mapear idiomas a códigos de Google
      const langMap = {
        es: "es_ES",
        en: "en_US",
        de: "de_DE",
      };

      const script = document.createElement("script");
      script.src = `https://accounts.google.com/gsi/client?hl=${langMap[i18n.lang] || "es_ES"}`;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  useEffect(() => {
    if (GOOGLE_CLIENT_ID) {
      // Limpiar script anterior
      const oldScripts = document.querySelectorAll(
        'script[src*="accounts.google.com/gsi/client"]'
      );
      oldScripts.forEach((script) => script.remove());

      // Limpiar variable global
      if (window.google) {
        delete window.google;
      }

      // Cargar script con el idioma correcto
      const langMap = {
        es: "es_ES",
        en: "en_US",
        de: "de_DE",
      };

      const script = document.createElement("script");
      script.src = `https://accounts.google.com/gsi/client?hl=${
        langMap[i18n.lang] || "es_ES"
      }`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        setTimeout(() => {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCallback,
          });

          const googleButton = document.getElementById("google-signin-button");
          if (googleButton) {
            googleButton.innerHTML = "";
            window.google.accounts.id.renderButton(googleButton, {
              theme: "outline",
              size: "large",
              width: "100%",
            });
          }
        }, 100);
      };

      script.onerror = () => {
        console.error("Error cargando Google Sign-In");
      };

      document.head.appendChild(script);
    }
  }, [i18n.lang]);

  return (
    <div className="min-h-dvh grid place-items-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h1 className="text-2xl font-bold text-center">
          {t("auth.login_title")}
        </h1>
        <p className="text-sm text-gray-600 mt-1 text-center">
          {t("auth.login_subtitle")}
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        {GOOGLE_CLIENT_ID && (
          <>
            <div className="mt-6">
              <div 
                id="google-signin-button" 
                className="w-full"
                data-lang={i18n.lang}
              />
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-sm text-gray-500">{t("auth.or")}</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>
          </>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("auth.email_label")}
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder={t("auth.email_placeholder")}
              autoComplete="email"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("auth.password_label")}
            </label>
            <div className="mt-1 relative">
              <input
                type={show ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 pr-20 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                tabIndex={-1}
              >
                {show ? t("auth.hide_password") : t("auth.show_password")}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={onChange}
                className="h-4 w-4 rounded border-gray-300"
                disabled={loading}
              />
              {t("auth.remember_me")}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-white font-medium hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? t("auth.submitting") : t("auth.submit_login")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {t("auth.no_account")}{" "}
          <Link to="/registro" className="font-medium hover:underline">
            {t("auth.go_register")}
          </Link>
        </p>
      </div>
    </div>
  );
}
