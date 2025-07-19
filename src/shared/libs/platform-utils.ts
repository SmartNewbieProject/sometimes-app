import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export const getAppStoreUrl = () => {
  if (isIOS) {
    return 'https://apps.apple.com/app/id6746120889';
  }
  return 'https://play.google.com/store/apps/details?id=com.smartnewb.sometimes&hl=ko';
};

export const getIOSStoreUrl = () => 'https://apps.apple.com/app/id6746120889';
export const getAndroidStoreUrl = () => 'https://play.google.com/store/apps/details?id=com.smartnewb.sometimes&hl=ko';