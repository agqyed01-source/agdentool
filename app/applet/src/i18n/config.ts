import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import ar from './locales/ar.json';

i18n
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      pt: { translation: pt },
      ru: { translation: ru },
      ar: { translation: ar },
    },
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    }
  });

export default i18n;
