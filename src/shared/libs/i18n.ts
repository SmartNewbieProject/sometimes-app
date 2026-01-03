import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from './locales/ko';
import ja from './locales/ja';
import en from './locales/en';
import { getUserLanguage } from './local';

const resources = {
  ja: { translation: ja },
  ko: { translation: ko },
  en: { translation: en },
};

// getUserLanguage()를 사용하여 TEST_LANGUAGE_OVERRIDE 지원
const deviceLanguage = getUserLanguage();
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
