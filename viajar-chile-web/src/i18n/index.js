import es from "./es.json";
import en from "./en.json";
import de from "./de.json";

const DICTS = { es, en, de };

export function createI18n(defaultLang = "es") {
  let lang = localStorage.getItem("lang") || defaultLang;
  let dict = DICTS[lang] || es;

  // set lang en el <html> desde el inicio
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang;
  }

  const setLang = (newLang) => {
    lang = newLang;
    dict = DICTS[newLang] || es;
    localStorage.setItem("lang", newLang);
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLang;
    }
    window.dispatchEvent(new CustomEvent("langchange"));
  };

  const t = (key, vars = {}) => {
    const raw = key.split(".").reduce((o, k) => (o ? o[k] : undefined), dict) ?? key;
    return Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{{${k}}}`, v), raw);
  };

  return { t, get lang() { return lang; }, setLang };
}

export const i18n = createI18n();
