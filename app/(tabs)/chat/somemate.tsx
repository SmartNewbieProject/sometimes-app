import { Image } from "expo-image";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { BottomNavigation } from "@/src/shared/ui/navigation";

const CATEGORIES = [
  { id: "daily", label: "일상" },
  { id: "relationship", label: "인간관계" },
  { id: "hobby", label: "진로/학교" },
  { id: "love", label: "연애" },
];

export default function SomemateScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState("daily");

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.characterContainer}>
          <Image
            source={require("@assets/images/somemate_miho.png")}
            style={styles.characterImage}
            contentFit="contain"
          />
        </View>

        <View style={styles.balloonContainer}>
          <Image
            source={require("@assets/images/promotion/content/balloon.png")}
            style={styles.balloonImage}
            contentFit="contain"
          />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>대화 주제 설정하기</Text>
          <Text style={styles.subtitle}>AI 미호와 나누고 싶은 대화 주제를 골라보세요!</Text>

          <View style={styles.categoryContainer}>
            {CATEGORIES.map((category) => (
              <Pressable
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.categoryTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </Pressable>
            ))}
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
          <Pressable
            style={styles.chatButton}
            onPress={() => router.push("/chat/somemate-chat")}
          >
            <Image
              source={require("@assets/images/white_heart.png")}
              style={styles.buttonIcon}
              contentFit="contain"
            />
            <Text style={styles.buttonText}>미호와 대화하기</Text>
          </Pressable>

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
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  characterContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  characterImage: {
    width: 240,
    height: 240,
  },
  balloonContainer: {
    position: "relative",
    alignItems: "flex-start",
    paddingLeft: 10,
    marginBottom: 2,
    height: 80,
  },
  balloonImage: {
    position: "absolute",
    bottom: 0,
    left: 10,
    width: 80,
    height: 80,
  },
  contentContainer: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
    fontFamily: "Pretendard-Bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#A2A2A2",
    marginBottom: 24,
    fontFamily: "Pretendard-Regular",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
  },
  categoryButtonActive: {
    backgroundColor: "#9747FF",
    borderColor: "#9747FF",
  },
  categoryText: {
    fontSize: 14,
    color: "#A2A2A2",
    fontFamily: "Pretendard-Medium",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  promotionContainer: {
    position: "relative",
    marginHorizontal: 16,
    backgroundColor: "#F7F3FF",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    overflow: "visible",
  },
  promotionTextContainer: {
    flex: 1,
  },
  promotionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9747FF",
    marginBottom: 8,
    fontFamily: "Pretendard-SemiBold",
  },
  promotionSubtitle: {
    fontSize: 12,
    color: "#A2A2A2",
    lineHeight: 18,
    fontFamily: "Pretendard-Regular",
  },
  reportImage: {
    position: "absolute",
    bottom: -40,
    right: 20,
    width: 100,
    height: 100
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 470,
    alignSelf: "center",
    paddingHorizontal: 16,
    marginTop: 60,
    marginBottom: 20,
  },
  chatButton: {
    width: "100%",
    backgroundColor: "#7A4AE2",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonIcon: {
    width: 24,
    height: 24,
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
    width: 30,
    height: 30,
  },
  reportButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#7A4AE2",
    fontFamily: "Pretendard-SemiBold",
  },
});

