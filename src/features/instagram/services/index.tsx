import { Linking, Alert } from "react-native";

export const openInstagram = async (instagramId: string) => {
  if (!instagramId) {
    Alert.alert('알림', '인스타그램 아이디가 없습니다.');
    return;
  }

  const instagramAppUrl = `instagram://user?username=${instagramId}`;
  const instagramWebUrl = `https://www.instagram.com/${instagramId}`;

  try {
    const canOpenApp = await Linking.canOpenURL(instagramAppUrl);
    if (canOpenApp) {
      await Linking.openURL(instagramAppUrl);
    } else {
      await Linking.openURL(instagramWebUrl);
    }
  } catch (error) {
    console.error('인스타그램 연결 오류:', error);
    try {
      await Linking.openURL(instagramWebUrl);
    } catch (webError) {
      Alert.alert('오류', '인스타그램에 연결할 수 없습니다.');
    }
  }
};
