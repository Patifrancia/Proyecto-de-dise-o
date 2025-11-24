import { i18n } from "../i18n";
import { useEffect, useState } from "react";

export default function Favoritos() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [, setLang] = useState(i18n.lang);

  useEffect(() => {
    const onChange = () => setLang(i18n.lang);
    window.addEventListener("langchange", onChange);
    return () => window.removeEventListener("langchange", onChange);
  }, []);

  const userName = user?.nombre || user?.correo || "Usuario";
  const title = i18n.t("favorites_title");
  const greeting = i18n.t("favorites_greeting", { name: userName });
  const emptyMessage = i18n.t("favorites_empty");

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-8">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-gray-600 mb-6">{greeting}</p>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-600">{emptyMessage}</p>
      </div>
    </div>
  );
}
