import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import ko from './locales/ko';
import ja from './locales/ja';

const resources = {
  ja: { translation: ja },
  ko: { translation: ko },
};

const deviceLocales = Localization.getLocales();
const deviceLang = deviceLocales[0]?.languageTag?.toLowerCase().startsWith('ja')
  ? 'ja'
  : 'ko';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: deviceLang,
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
