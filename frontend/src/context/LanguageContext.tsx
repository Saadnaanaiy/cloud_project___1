import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { translations, type TranslationKey } from './translations';

type Language = 'en' | 'fr' | 'ar';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType>({} as LanguageContextType);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Language;
    if (saved && ['en', 'fr', 'ar'].includes(saved)) setLang(saved);
  }, []);

  const changeLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const t = (key: TranslationKey): string =>
    translations[lang][key] || translations['en'][key] || key;

  const dir: 'ltr' | 'rtl' = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  const value = useMemo(() => ({ lang, setLang: changeLang, t, dir }), [lang, t, dir]);

  return (
    <LanguageContext.Provider value={value}>
      <div dir={dir} style={{ width: '100vw', minHeight: '100vh' }}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
