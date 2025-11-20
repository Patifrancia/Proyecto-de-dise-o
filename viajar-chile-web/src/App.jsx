import "./App.css";
import "./index.css";
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import Home from "./paginas/home.jsx";
import Login from "./paginas/Login.jsx";
import Buscar from "./paginas/Buscar.jsx";
import Planificar from "./paginas/Planificar.jsx";
import Favoritos from "./paginas/Favoritos.jsx";
import Costos from "./paginas/Costos.jsx";
import { i18n } from "./i18n";
import rutaclLogo from "./assets/rutacl.png"; 

function getInitials(nameOrEmail) {
  const s = (nameOrEmail || "").trim();
  if (!s) return "U";
  const parts = s.includes("@") ? s.split("@")[0].split(/[.\s_-]+/) : s.split(/\s+/);
  const ini = (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
  return ini.toUpperCase() || "U";
}

/** Selector de idioma inline (ES/EN/DE) */
function LanguageSwitcherInline() {
  const [lang, setLangState] = useState(i18n.lang);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onChange = () => setLangState(i18n.lang);
    window.addEventListener("langchange", onChange);
    return () => window.removeEventListener("langchange", onChange);
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20"
        title="Idioma"
      >
        {lang.toUpperCase()}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-28 rounded-xl bg-white text-gray-800 shadow ring-1 ring-black/5 overflow-hidden">
          {["es", "en", "de"].map((code) => (
            <button
              key={code}
              onClick={() => { i18n.setLang(code); setOpen(false); }}
              className="w-full px-3 py-2 text-left hover:bg-gray-50"
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHome = pathname === "/";

  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      setUser(u);
    } catch {}
    const onStorage = () => {
      try {
        const u = JSON.parse(localStorage.getItem("user") || "null");
        setUser(u);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const headerClass = isHome
    ? "absolute top-0 left-0 right-0 z-50 text-white"
    : "sticky top-0 z-50 bg-white/90 supports-[backdrop-filter]:bg-white/70 backdrop-blur border-b border-gray-200 text-gray-900";

  const btnClass = isHome
    ? "px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition"
    : "px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition";

  const brandClass = isHome ? "font-semibold" : "font-semibold text-gray-900";

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMenuOpen(false);
    navigate("/");
  }

  return (
    <header className={headerClass}>
      <nav className="mx-auto w-full max-w-screen-xl px-4 py-3 flex items-center justify-between">
        <Link to="/">
          <img
            src={rutaclLogo}
            alt="RutaCL"
            className="h-24 w-auto"
          />
        </Link>

        {/* derecha: selector + login o avatar */}
        <div className="flex gap-3 items-center">
          <LanguageSwitcherInline />

          {!user ? (
            <Link to="/login" className={btnClass}>
              {i18n.t("login")}
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(v => !v)}
                className={`${isHome ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"} flex items-center gap-2 rounded-full px-2 py-1.5 transition`}
              >
                <div className="h-8 w-8 rounded-full bg-emerald-600 grid place-items-center text-xs font-bold text-white">
                  {getInitials(user.nombre || user.correo)}
                </div>
                <span className="hidden sm:block text-sm">
                  {user.nombre || user.correo}
                </span>
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-white text-gray-800 shadow-lg ring-1 ring-black/5 overflow-hidden"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <div className="px-4 py-3 border-b text-sm">
                    <div className="font-medium">{user.nombre || "Usuario"}</div>
                    <div className="text-gray-600 truncate">{user.correo}</div>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-gray-50"
                  >
                    <LogOut size={16} /> {i18n.t("logout")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

// ⬇️ PrivateRoute debe estar FUERA de Header
function PrivateRoute({ children }) {
  const hasToken = !!localStorage.getItem("token");
  return hasToken ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <div className="min-h-dvh bg-gray-50 text-gray-900 flex flex-col">
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route path="/buscar" element={<Buscar />} />
        <Route path="/planificar" element={<Planificar />} />
        <Route
          path="/favoritos"
          element={
            <PrivateRoute>
              <Favoritos />
            </PrivateRoute>
          }
        />
        <Route path="/costos" element={<Costos />} />

        <Route path="/registro" element={<div className="p-6">Registro (pendiente)</div>} />
        <Route path="*" element={<div className="p-6">404</div>} />
      </Routes>
    </div>
  );
}

