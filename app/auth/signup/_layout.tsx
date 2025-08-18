import { DefaultLayout } from "@/src/features/layout/ui";
import { useWindowWidth } from "@/src/features/signup/hooks";
import colors from "@/src/shared/constants/colors";
import { OverlayProvider } from "@/src/shared/hooks/use-overlay";
import Loading from "@features/loading";
import Signup from "@features/signup";
import { useFocusEffect } from "@react-navigation/native";
import { cn } from "@shared/libs/cn";
import { platform } from "@shared/libs/platform";
import { PalePurpleGradient } from "@shared/ui/gradient";
import { ProgressBar } from "@shared/ui/progress-bar";
import { Stack, router, usePathname } from "expo-router";
import { Suspense, useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BackHandler } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { useSignupProgress, SignupSteps } = Signup;

export default function SignupLayout() {
  const { progress, updateStep, univTitle, step } = useSignupProgress();

  const pathname = usePathname();
  const renderProgress = pathname !== "/auth/signup/done";
  const width = useWindowWidth();
  const progressWidth = width > 480 ? 448 : width - 32;
  const insets = useSafeAreaInsets();
  const titleMap = {
    [SignupSteps.AREA]: "지역 선택하기",
    [SignupSteps.UNIVERSITY]: univTitle,
    [SignupSteps.UNIVERSITY_DETAIL]: "추가 정보 입력하기",
    [SignupSteps.INSTAGRAM]: "인스타그램 아이디 입력하기",
    [SignupSteps.PROFILE_IMAGE]: "프로필 사진 추가하기",
  };

  const title = titleMap[step];
  return (
    <DefaultLayout className="flex-1 relative">
      <OverlayProvider>
        <PalePurpleGradient />
        {renderProgress && (
          <>
            <View
              style={[
                styles.titleContainer,
                { paddingTop: insets.top + 10, paddingBottom: 10 },
              ]}
            >
              <Text style={styles.title}>{title}</Text>
            </View>

            <View
              className={cn(
                " pb-[30px] items-center bg-white",
                platform({
                  ios: () => "",
                  android: () => "",
                  web: () => "",
                })
              )}
            >
              <ProgressBar progress={progress} width={progressWidth} />
            </View>
          </>
        )}
        <Suspense fallback={<Loading.Page />}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: "transparent",
              },
              animation: "slide_from_right",
            }}
          >
            <Stack.Screen name="terms" options={{ headerShown: false }} />
            <Stack.Screen name="area" options={{ headerShown: false }} />
            <Stack.Screen
              name="university"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="university-details"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="instagram" options={{ headerShown: false }} />
            <Stack.Screen
              name="profile-image"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="done" options={{ headerShown: false }} />
          </Stack>
        </Suspense>
      </OverlayProvider>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.black,
    fontFamily: "Pretendard-Bold",
    fontWeight: 700,
    lineHeight: 22,
    fontSize: 20,
  },
});
