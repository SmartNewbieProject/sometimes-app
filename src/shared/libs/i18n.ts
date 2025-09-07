import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getUserLanguage } from './local';
import ko from './locales/ko';
import ja from './locales/ja';

const resources = {
  ja: {
    translation: ja,
  },
  ko: {
    translation: ko,
  },
};

const supportedLngs = ['ja', 'ko'];
const userLang = getUserLanguage();

i18n.use(initReactI18next).init({
  resources,
  lng: supportedLngs.includes(userLang) ? userLang : 'ko',
  fallbackLng: {
    "ko-*:": ['ko'],
    "ja-*:": ['ja'],
    default: ['ko'],},
  interpolation: {
    escapeValue: false, 
  },
  react: {
    useSuspense: false, 
  },
});

export default i18n;