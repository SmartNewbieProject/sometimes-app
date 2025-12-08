import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import ko from './locales/ko';
import ja from './locales/ja';
import en from './locales/en';

const resources = {
  ja: { translation: ja },
  ko: { translation: ko },
  en: { translation: en },
};

// 기기 언어 감지
const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'ko';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: deviceLanguage,
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    defaultNS: 'common',
  });

export default i18n;
