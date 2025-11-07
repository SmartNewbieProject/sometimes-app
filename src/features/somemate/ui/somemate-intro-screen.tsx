import { Image } from "expo-image";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { Button, BottomNavigation } from "@/src/shared/ui";

export default function SomemateIntroScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.characterContainer}>
          <Image
            source={require("@assets/images/somemate_miho.png")}
            style={styles.characterImage}
            contentFit="contain"
          />
        </View>

        <View style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>카테고리 선택</Text>
          <View style={styles.categoryButtons}>
            <Pressable style={[styles.categoryButton, styles.categoryButtonActive]}>
              <Text style={[styles.categoryButtonText, styles.categoryButtonTextActive]}>
                썸 고민
              </Text>
            </Pressable>
            <Pressable style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>연애 고민</Text>
            </Pressable>
            <Pressable style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>일상 대화</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.promotionContainer}>
          <View style={styles.promotionTextContainer}>
            <Text style={styles.promotionTitle}>썸타입은 충분한 대화가 쌓인 후에 생성돼요</Text>
            <Text style={styles.promotionSubtitle}>
              미호와 대화를 이어가며 나만의 패턴을{"\n"}발견해보세요!
            </Text>
          </View>
          <Image
            source={require("@assets/images/somemate_report.png")}
            style={styles.reportImage}
            contentFit="contain"
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            onPress={() => router.push("/chat/somemate-chat")}
            className="w-full"
          >
            <View style={styles.buttonContent}>
              <Image
                source={require("@assets/images/white_heart.png")}
                style={styles.buttonIcon}
                contentFit="contain"
              />
              <Text style={styles.buttonText}>미호와 대화하기</Text>
            </View>
          </Button>

          <Pressable
            style={styles.reportButton}
            onPress={() => router.push("/chat/somemate-report")}
          >
            <Image
              source={require("@assets/images/details.png")}
              style={styles.reportIcon}
              contentFit="contain"
            />
            <Text style={styles.reportButtonText}>썸메이트 리포트 보러가기</Text>
          </Pressable>
        </View>
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  characterContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 32,
  },
  characterImage: {
    width: 200,
    height: 200,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Pretendard-SemiBold",
    color: "#000",
    marginBottom: 12,
  },
  categoryButtons: {
    flexDirection: "row",
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#fff",
  },
  categoryButtonActive: {
    borderColor: "#7A4AE2",
    backgroundColor: "#F7F3FF",
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  categoryButtonTextActive: {
    color: "#7A4AE2",
    fontWeight: "600",
  },
  promotionContainer: {
    backgroundColor: "#F7F3FF",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  promotionTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  promotionTitle: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Pretendard-Bold",
    color: "#000",
    marginBottom: 8,
  },
  promotionSubtitle: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },
  reportImage: {
    width: 80,
    height: 80,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 470,
    alignSelf: "center",
    paddingHorizontal: 16,
    marginTop: 60,
    marginBottom: 20,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonIcon: {
    width: 20,
    height: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Pretendard-SemiBold",
  },
  reportButton: {
    width: "100%",
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#7A4AE2",
    backgroundColor: "#fff",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  reportIcon: {
    width: 20,
    height: 20,
  },
  reportButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#7A4AE2",
    fontFamily: "Pretendard-SemiBold",
  },
});

