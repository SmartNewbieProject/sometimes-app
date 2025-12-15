import { Image } from "expo-image";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { router, useFocusEffect } from "expo-router";
import { ScrollView, StyleSheet, View, Pressable, ActivityIndicator, Text as RNText, BackHandler, TouchableOpacity } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BottomNavigation } from "@/src/shared/ui/navigation";
import { useActiveSession, useCreateSession } from "@/src/features/somemate/queries/use-ai-chat";
import { useModal } from "@/src/shared/hooks/use-modal";
import { useKpiAnalytics } from "@/src/shared/hooks";
import type { AiChatCategory } from "@/src/features/somemate/types";
import { ReportButton } from "@/src/features/somemate/ui/report-button";
import { useCurrentGem } from "@/src/features/payment/hooks/use-current-gem";
import { Text } from "@/src/shared/ui";

const CATEGORY_KEYS = ["daily", "relationship", "hobby", "love"] as const;

export default function SomemateScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<AiChatCategory>(t('features.somemate.intro.categories.daily') as AiChatCategory);
  const { showModal } = useModal();
  const { somemateEvents } = useKpiAnalytics();

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
        title: t('features.somemate.modal.gem_shortage.title'),
        children: (
          <View style={{ flexDirection: "column" }}>
            <Text>{t('features.somemate.modal.gem_shortage.message_1')}</Text>
            <Text>{t('features.somemate.modal.gem_shortage.message_2')}</Text>
          </View>
        ),
        primaryButton: {
          text: t('features.somemate.modal.error.confirm'),
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
            {t('features.somemate.modal.start_chat.title_1')}
          </Text>
          <Text textColor="black" weight="bold" size="20">
            {t('features.somemate.modal.start_chat.title_2')}
          </Text>
        </View>
      ),
      children: (
        <View style={{ flexDirection: "column", width: "100%", alignItems: "center", marginTop: 8 }}>
          <Text style={{ color: "#AEAEAE", fontSize: 12 }}>
            {t('features.somemate.modal.start_chat.discount_info')}
          </Text>
          <Text style={{ color: "#AEAEAE", fontSize: 12 }}>
            {t('features.somemate.modal.start_chat.discount_subtitle')}
          </Text>
        </View>
      ),
      primaryButton: {
        text: t('features.somemate.modal.start_chat.confirm'),
        onClick: async () => {
          try {
            somemateEvents.trackSessionStarted('pending', selectedCategory);
            const response = await createSessionMutation.mutateAsync({
              category: selectedCategory,
            });
            somemateEvents.trackSessionStarted(response.sessionId, selectedCategory);
            router.push(`/chat/somemate-chat?sessionId=${response.sessionId}`);
          } catch (error: unknown) {
            showModal({
              title: t('features.somemate.modal.error.title'),
              children: (
                <View style={{ flexDirection: "column" }}>
                  <Text>{(error as Error)?.message || t('features.somemate.modal.error.session_failed')}</Text>
                </View>
              ),
              primaryButton: {
                text: t('features.somemate.modal.error.confirm'),
                onClick: () => {},
              },
            });
          }
        },
      },
      secondaryButton: {
        text: t('features.somemate.modal.start_chat.cancel'),
        onClick: () => {},
      },
    });
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ChevronLeft size={24} color={semanticColors.text.primary} />
        </TouchableOpacity>
        <RNText style={styles.headerTitle}>{t('features.somemate.intro.header_title')}</RNText>
        <View style={styles.headerRight} />
      </View>

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
          <RNText style={styles.title}>{t('features.somemate.intro.topic_title')}</RNText>
          <RNText style={styles.subtitle}>{t('features.somemate.intro.topic_subtitle')}</RNText>

          <View style={styles.categoryContainer}>
            {CATEGORY_KEYS.map((categoryKey) => {
              const categoryLabel = t(`features.somemate.intro.categories.${categoryKey}`) as AiChatCategory;
              return (
                <Pressable
                  key={categoryKey}
                  onPress={() => {
                    setSelectedCategory(categoryLabel);
                    somemateEvents.trackCategorySelected(categoryLabel);
                  }}
                  style={[
                    styles.categoryButton,
                    selectedCategory === categoryLabel && styles.categoryButtonActive,
                  ]}
                >
                  <RNText
                    style={[
                      styles.categoryText,
                      selectedCategory === categoryLabel && styles.categoryTextActive,
                    ]}
                  >
                    {categoryLabel}
                  </RNText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.promotionContainer}>
          <View style={styles.promotionTextContainer}>
            <RNText style={styles.promotionTitle}>{t('features.somemate.intro.promotion.title')}</RNText>
            <RNText style={styles.promotionSubtitle}>
              {t('features.somemate.intro.promotion.subtitle')}
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
                <RNText style={styles.buttonText}>{t('features.somemate.intro.chat_button')}</RNText>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: semanticColors.surface.background,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: semanticColors.text.primary,
    fontFamily: "Pretendard-SemiBold",
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  characterContainer: {
    alignItems: "center",
    marginTop: 20,
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

