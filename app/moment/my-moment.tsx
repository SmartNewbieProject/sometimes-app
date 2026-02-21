import React, { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { MyMomentPage } from "@/src/features/moment/ui/my-moment";
import { BottomNavigation } from "@/src/shared/ui";
import colors from "@/src/shared/constants/colors";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { useOnboardingStatusQuery } from "@/src/features/moment/queries/onboarding";
import { useMomentOnboardingEnabled } from "@/src/features/moment/queries/use-moment-onboarding-enabled";

export default function MyMomentRoute() {
  const router = useRouter();
  const { t } = useTranslation();

  // 피쳐플래그 확인
  const { data: onboardingFlag, isLoading: isFlagLoading, error: flagError } = useMomentOnboardingEnabled();
  const isOnboardingEnabled = !flagError && onboardingFlag?.enabled === true;

  // 피쳐플래그가 켜진 경우에만 온보딩 상태 API 호출
  const { data: onboardingStatus, isLoading: isStatusLoading, error: statusError } =
    useOnboardingStatusQuery(isOnboardingEnabled && !isFlagLoading);

  const isLoading = isFlagLoading || (isOnboardingEnabled && isStatusLoading);

  useEffect(() => {
    // 피쳐플래그 ON + API 성공 + 온보딩 필요한 경우에만 리다이렉트
    if (!isLoading && isOnboardingEnabled && !statusError && onboardingStatus?.needsOnboarding) {
      router.replace('/moment/onboarding');
    }
  }, [isLoading, isOnboardingEnabled, statusError, onboardingStatus]);

  // 로딩 중일 때
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryPurple} />
      </View>
    );
  }

  // 온보딩 필요한 경우 (리다이렉트 대기)
  if (isOnboardingEnabled && !statusError && onboardingStatus?.needsOnboarding) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryPurple} />
      </View>
    );
  }

  // 피쳐플래그 OFF / 에러 / 온보딩 불필요 → 기존 페이지 표시

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: t("apps.moment.common.moment_questions"),
          headerTitleAlign: "center",
          headerBackTitleVisible: false,
          headerTintColor: semanticColors.text.primary,
          headerStyle: {
            backgroundColor: colors.momentBackground,
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push('/moment')}
              style={{ marginLeft: 16 }}
            >
              <ChevronLeft size={24} color={semanticColors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <MyMomentPage
        onBackPress={() => router.push('/moment')}
      />
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.momentBackground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.momentBackground,
  },
});
