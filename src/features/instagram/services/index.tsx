import { Linking, Alert } from "react-native";

export const openInstagram = async (instagramId: string) => {
  if (!instagramId) {
    Alert.alert('알림', '인스타그램 아이디가 없습니다.');
    return;
  }

  const instagramProfileUrl = `https://www.instagram.com/${instagramId}`;
  
  try {
    await Linking.openURL(instagramProfileUrl);
  } catch (error) {
    console.error('인스타그램 연결 오류:', error);
    Alert.alert('오류', '인스타그램에 연결할 수 없습니다.');
  }
};
