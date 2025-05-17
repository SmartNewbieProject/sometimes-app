import { Linking, Alert } from "react-native";

/**
 * 인스타그램 ID가 유효한지 확인하는 함수
 * 인스타그램 ID는 영문, 숫자, 밑줄, 마침표만 포함할 수 있음
 */
const isValidInstagramId = (id: string): boolean => {
  if (!id || id.trim() === '') return false;

  // 인스타그램 ID 유효성 검사 (영문, 숫자, 밑줄, 마침표만 허용)
  const regex = /^[a-zA-Z0-9._]+$/;
  return regex.test(id);
};

export const openInstagram = async (instagramId: string) => {
  // 인스타그램 ID 유효성 검사
  if (!instagramId || !isValidInstagramId(instagramId)) {
    Alert.alert('알림', '유효하지 않은 인스타그램 아이디입니다.');
    return;
  }

  // 웹 브라우저에서 열 인스타그램 URL 생성
  const instagramWebUrl = `https://www.instagram.com/${instagramId}`;

  console.log('인스타그램 연결 시도:', { instagramId, instagramWebUrl });

  try {
    // 웹 브라우저로 바로 열기
    await Linking.openURL(instagramWebUrl);
  } catch (error) {
    console.error('웹 브라우저 연결 오류:', error);
    Alert.alert('오류', '인스타그램에 연결할 수 없습니다.');
  }
};
