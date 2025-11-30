import ChevronLeftIcon from "@/assets/icons/chevron-left.svg";
import { Header, PalePurpleGradient, Text } from "@/src/shared/ui";
import { semanticColors } from "@/src/shared/constants/colors";
import { router } from "expo-router";
import { Image, Pressable, TouchableOpacity, View, StyleSheet } from "react-native";

export default function UniversityVerificationSuccess() {
  const handleGoToProfile = () => {
    router.push("/home");
  };

  return (
    <View style={styles.container}>
      <PalePurpleGradient />
      <Header.Container>
        <Header.LeftContent>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeftIcon width={24} height={24} />
          </Pressable>
        </Header.LeftContent>
        <Header.CenterContent>
          <Text size="lg" weight="normal" textColor="black">
            대학 인증
          </Text>
        </Header.CenterContent>
        <Header.RightContent />
      </Header.Container>

      <View style={styles.contentContainer}>
        {/* 메인 이미지 */}
        <View style={styles.imageContainer}>
          <Image
            source={require("@/assets/images/verification-done.png")}
            style={{ width: 320, height: 320 }}
            resizeMode="contain"
          />
        </View>

        {/* 메인 텍스트 */}
        <View style={styles.textContainer}>
          <Text size="lg" weight="normal" textColor="black" style={styles.firstTitle}>
            축하드려요!
          </Text>
          <Text size="lg" weight="normal" textColor="black" style={styles.secondTitle}>
            대학 인증이 완료되었어요!
          </Text>

          <Text size="sm" weight="normal" style={styles.firstDescription}>
            이제 안심하고 시작해볼까요?
          </Text>
          <Text size="sm" weight="normal" style={styles.secondDescription}>
            내가 있는 지역에서 이상형을 안전하게 만나보세요!
          </Text>
        </View>

        {/* 하단 버튼 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleGoToProfile}
            style={styles.button}
          >
            <Text size="md" weight="semibold" textColor="white">
              이상형 찾으러 가기 →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imageContainer: {
    marginBottom: 64,
    marginTop: 32,
    alignItems: 'center',
    marginLeft: 24,
  },
  textContainer: {
    marginBottom: 80,
    width: '80%',
    alignItems: 'flex-start',
  },
  firstTitle: {
    marginBottom: 4,
  },
  secondTitle: {
    marginBottom: 8,
  },
  firstDescription: {
    marginBottom: 4,
    color: semanticColors.text.disabled,
  },
  secondDescription: {
    color: semanticColors.text.disabled,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
  },
  button: {
    backgroundColor: semanticColors.brand.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
});
