import { Image } from "expo-image";
import { semanticColors } from '../../../src/shared/constants/colors';
import { router, useFocusEffect } from "expo-router";
import { ScrollView, StyleSheet, View, Pressable, ActivityIndicator, Text as RNText, BackHandler } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useCallback, useEffect } from "react";
import { BottomNavigation } from "@/src/shared/ui/navigation";
import { useActiveSession, useCreateSession } from "@/src/features/somemate/queries/use-ai-chat";
import { useModal } from "@/src/shared/hooks/use-modal";
import type { AiChatCategory } from "@/src/features/somemate/types";
import { ReportButton } from "@/src/features/somemate/ui/report-button";
import { useCurrentGem } from "@/src/features/payment/hooks/use-current-gem";
import { Text } from "@/src/shared/ui";

const CATEGORIES: Array<{ id: string; label: AiChatCategory }> = [
  { id: "daily", label: "일상" },
  { id: "relationship", label: "인간관계" },
  { id: "hobby", label: "진로/학교" },
  { id: "love", label: "연애" },
];

export default function SomemateScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<AiChatCategory>("일상");
  const { showModal } = useModal();

  const { data: activeSession, isLoading: isLoadingSession, refetch } = useActiveSession();
  const createSessionMutation = useCreateSession();
  const { data: gemData } = useCurrentGem();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  useEffect(() => {
    const onBackPress = () => {
      router.replace("/chat");
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => subscription.remove();
  }, []);

  const handleStartChat = async () => {
    if (isLoadingSession) return;

    if (activeSession) {
      router.push(`/chat/somemate-chat?sessionId=${activeSession.id}`);
      return;
    }

    const currentGem = gemData?.totalGem ?? 0;
    if (currentGem < 1) {
      showModal({
        title: "구슬이 부족해요",
        children: (
          <View style={{ flexDirection: "column" }}>
            <Text>썸메이트 대화를 시작하려면 구슬 1개가 필요해요.</Text>
            <Text>구슬을 충전하고 미호와 대화해보세요!</Text>
          </View>
        ),
        primaryButton: {
          text: "확인",
          onClick: () => {},
        },
      });
      return;
    }

    showModal({
      showLogo: true,
      customTitle: (
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Text textColor="black" weight="bold" size="20">
            AI 미호와 대화를 시작하기 위해
          </Text>
          <Text textColor="black" weight="bold" size="20">
            구슬 1개를 사용할게요!
          </Text>
        </View>
      ),
      children: (
        <View style={{ flexDirection: "column", width: "100%", alignItems: "center", marginTop: 8 }}>
          <Text style={{ color: "#AEAEAE", fontSize: 12 }}>
            🎉 오픈 할인가! 5개 → 1개
          </Text>
          <Text style={{ color: "#AEAEAE", fontSize: 12 }}>
            특별 할인가로 AI 미호와 대화해보세요
          </Text>
        </View>
      ),
      primaryButton: {
        text: "네, 해볼래요",
        onClick: async () => {
          try {
            const response = await createSessionMutation.mutateAsync({
              category: selectedCategory,
            });
            router.push(`/chat/somemate-chat?sessionId=${response.sessionId}`);
          } catch (error: unknown) {
            showModal({
              title: "오류",
              children: (
                <View style={{ flexDirection: "column" }}>
                  <Text>{(error as Error)?.message || "세션 생성에 실패했습니다."}</Text>
                </View>
              ),
              primaryButton: {
                text: "확인",
                onClick: () => {},
              },
            });
          }
        },
      },
      secondaryButton: {
        text: "취소",
        onClick: () => {},
      },
    });
  };

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
          <RNText style={styles.title}>대화 주제 설정하기</RNText>
          <RNText style={styles.subtitle}>AI 미호와 나누고 싶은 대화 주제를 골라보세요!</RNText>

          <View style={styles.categoryContainer}>
            {CATEGORIES.map((category) => (
              <Pressable
                key={category.id}
                onPress={() => setSelectedCategory(category.label)}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.label && styles.categoryButtonActive,
                ]}
              >
                <RNText
                  style={[
                    styles.categoryText,
                    selectedCategory === category.label && styles.categoryTextActive,
                  ]}
                >
                  {category.label}
                </RNText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.promotionContainer}>
          <View style={styles.promotionTextContainer}>
            <RNText style={styles.promotionTitle}>썸타임은 충분한 대화가 쌓인 후에 생성돼요</RNText>
            <RNText style={styles.promotionSubtitle}>
              미호와 대화를 이어가며 나만의 패턴을{"\n"}발견해보세요!
            </RNText>
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
            onPress={handleStartChat}
            disabled={isLoadingSession || createSessionMutation.isPending}
          >
            {(isLoadingSession || createSessionMutation.isPending) ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Image
                  source={require("@assets/images/white_heart.png")}
                  style={styles.buttonIcon}
                  contentFit="contain"
                />
                <RNText style={styles.buttonText}>미호와 대화하기</RNText>
              </>
            )}
          </Pressable>

          <ReportButton />
        </View>
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.background,
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
    color: semanticColors.text.primary,
    marginBottom: 8,
    fontFamily: "Pretendard-Bold",
  },
  subtitle: {
    fontSize: 14,
    color: semanticColors.text.disabled,
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
    borderColor: semanticColors.border.default,
    backgroundColor: semanticColors.surface.background,
  },
  categoryButtonActive: {
    backgroundColor: semanticColors.brand.secondary,
    borderColor: semanticColors.brand.secondary,
  },
  categoryText: {
    fontSize: 14,
    color: semanticColors.text.disabled,
    fontFamily: "Pretendard-Medium",
  },
  categoryTextActive: {
    color: semanticColors.text.inverse,
  },
  promotionContainer: {
    position: "relative",
    marginHorizontal: 16,
    backgroundColor: semanticColors.surface.surface,
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
    color: semanticColors.brand.secondary,
    marginBottom: 8,
    fontFamily: "Pretendard-SemiBold",
  },
  promotionSubtitle: {
    fontSize: 12,
    color: semanticColors.text.disabled,
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
    backgroundColor: semanticColors.brand.primary,
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
    color: semanticColors.text.inverse,
    fontFamily: "Pretendard-SemiBold",
  },
});

