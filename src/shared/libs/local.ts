import * as Localization from 'expo-localization';


export function getUserLanguage() {
  const deviceLocales = Localization.getLocales();
  const userLangTag = deviceLocales[0].languageTag;
  console.log({userLangTag: userLangTag});
  return deviceLocales[0].languageTag || 'ko'; 
}