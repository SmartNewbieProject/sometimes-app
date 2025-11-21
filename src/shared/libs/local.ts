import * as Localization from 'expo-localization';


export function getUserLanguage() {
  const deviceLocales = Localization.getLocales();
  return deviceLocales[0].languageTag || 'ko'; 
}