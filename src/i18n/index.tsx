import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { en, pl, type Dict } from "./translations";

export type Lang = "en" | "pl";

const dicts: Record<Lang, Dict> = { en, pl };
const STORAGE_KEY = "vid-lang";

function detectBrowserLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  const langs = navigator.languages ?? [navigator.language];
  for (const l of langs) {
    if (l?.toLowerCase().startsWith("pl")) return "pl";
  }
  return "en";
}

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict };
const I18nContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: en });

export function I18nProvider({ children }: { children: ReactNode }) {
  // SSR + initial client render: always "en" to avoid hydration mismatch.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = (typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEY)) as Lang | null;
    const next = stored === "en" || stored === "pl" ? stored : detectBrowserLang();
    if (next !== "en") setLangState(next);
    if (typeof document !== "undefined") document.documentElement.lang = next;
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, l);
    if (typeof document !== "undefined") document.documentElement.lang = l;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t: dicts[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT() {
  return useContext(I18nContext).t;
}
export function useLang() {
  const { lang, setLang } = useContext(I18nContext);
  return { lang, setLang };
}
