import * as Localization from 'expo-localization';

export function getUserLanguage(): string {
  const deviceLocales = Localization.getLocales();
  return deviceLocales[0]?.languageCode || 'ko';
}

export function isJapanese(): boolean {
  return getUserLanguage() === 'ja';
}