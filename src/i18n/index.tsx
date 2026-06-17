import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { en, pl, type Dict } from "./translations";

export type Lang = "en" | "pl";

const dicts: Record<Lang, Dict> = { en, pl };
const STORAGE_KEY = "vid-lang";

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict };
const I18nContext = createContext<Ctx>({ lang: "pl", setLang: () => {}, t: pl });

export function I18nProvider({ children }: { children: ReactNode }) {
  // EN czasowo wyłączone — wymuszamy PL na całej aplikacji.
  const [lang] = useState<Lang>("pl");

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = "pl";
    if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, "pl");
  }, []);

  const setLang = (_l: Lang) => {
    // no-op: tylko PL
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
