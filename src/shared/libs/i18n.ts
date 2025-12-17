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

// 기기 언어 감지 (지원하는 언어만 사용, 나머지는 한국어로 fallback)
const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'ko';
const supportedLanguages = ['ko', 'ja'];
const initialLanguage = supportedLanguages.includes(deviceLanguage) ? deviceLanguage : 'ko';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
