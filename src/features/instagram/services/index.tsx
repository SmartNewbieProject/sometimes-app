import { Linking, Alert } from "react-native";

export const openInstagram = async (instagramId: string) => {
  if (!instagramId) {
    Alert.alert('알림', '인스타그램 아이디가 없습니다.');
    return;
  }

  const username = instagramId.replace(/^@/, '').trim();
  const instagramProfileUrl = `https://www.instagram.com/${username}`;

  try {
    // 모든 플랫폼에서 웹 링크로 열기
    // 브라우저에서 자동으로 앱으로 리다이렉트됨
    await Linking.openURL(instagramProfileUrl);
  } catch (error) {
    console.error('인스타그램 연결 오류:', error);
    Alert.alert('오류', '인스타그램에 연결할 수 없습니다.');
  }
};
