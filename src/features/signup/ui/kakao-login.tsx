import KakaoLogo from "@assets/icons/kakao-logo.svg";
import { Platform, Pressable, Text, View, StyleSheet } from "react-native";

interface KakaoLoginProps {
  onKakaoLoginStart?: () => void;
  onKakaoLoginComplete?: () => void;
}

export default function KakaoLogin({
  onKakaoLoginStart,
  onKakaoLoginComplete
}: KakaoLoginProps) {
  const KAKAO_CLIENT_ID = process.env.EXPO_PUBLIC_KAKAO_LOGIN_API_KEY as string;
  const redirectUri = process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI as string;

  const handleKakaoLogin = () => {
    onKakaoLoginStart?.();

    if (Platform.OS === "web") {
      // 웹에서는 기존 방식 유지
      const scope = [
        "name",
        "gender",
        "birthyear",
        "birthday",
        "phone_number",
      ].join(" ");

      const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=code&scope=${encodeURIComponent(scope)}`;

      window.location.href = kakaoAuthUrl;
    } else {
      // 앱에서는 부모 컴포넌트에서 WebView를 관리
      onKakaoLoginComplete?.();
    }
  };

  return (
    <View style={styles.kakaoButtonContainer}>
      <Pressable
        onPress={handleKakaoLogin}
        style={styles.kakaoButton}
      >
        <View style={styles.kakaoLogoContainer}>
          <KakaoLogo width={34} height={34} />
        </View>
        <View>
          <Text style={styles.kakaoButtonText}>카카오 로그인</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  kakaoButtonContainer: {
    width: '100%',
  },
  kakaoButton: {
    flexDirection: 'row',
    width: 330,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16, // py-4
    borderRadius: 9999, // rounded-full
    backgroundColor: '#FEE500',
    gap: 6, // column-gap: .375rem
  },
  kakaoLogoContainer: {
    width: 34,
    height: 34,
  },
  kakaoButtonText: {
    fontSize: 16,
    fontWeight: '700', // bold
    fontFamily: 'Pretendard-Bold',
    color: '#000000',
  },
});