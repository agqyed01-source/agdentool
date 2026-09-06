import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'es', name: 'Español', dir: 'ltr' },
  { code: 'pt', name: 'Português', dir: 'ltr' },
  { code: 'ru', name: 'Русский', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
];

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];
    document.documentElement.dir = currentLang.dir;
    document.documentElement.lang = currentLang.code;
  }, [i18n.language]);

  return (
    <div className="relative group inline-block">
      <button className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors py-2">
        <Globe size={16} />
        <span className="uppercase">{i18n.language.split('-')[0]}</span>
      </button>
      <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${i18n.language.startsWith(lang.code) ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'}`}
          >
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
};
