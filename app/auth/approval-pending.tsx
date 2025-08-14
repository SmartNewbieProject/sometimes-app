import SmallTitleIcon from "@/assets/icons/small-title.svg";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { DefaultLayout } from "@/src/features/layout/ui";
import { Button, PalePurpleGradient, Text } from "@/src/shared/ui";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect } from "react";
import { BackHandler, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ApprovalPendingScreen() {
  const { logoutOnly } = useAuth();
  const insets = useSafeAreaInsets();
  const handleGoToLogin = async () => {
    await logoutOnly();
    router.push("/auth/login");
  };
  useEffect(() => {
    const onBackPress = () => {
      router.navigate("/auth/login");
      return true;
    };

    // 이벤트 리스너 등록
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    // 컴포넌트 언마운트 시 리스너 제거
    return () => subscription.remove();
  }, []);

  return (
    <DefaultLayout className="flex-1 flex flex-col w-full items-center">
      <PalePurpleGradient />

      <ScrollView
        className="flex-1 w-full"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 justify-center items-center px-6 py-12">
          {/* SOMETIME 로고 */}
          <View className="mb-8">
            <SmallTitleIcon width={160} height={40} />
          </View>

          {/* 메인 이미지 */}
          <View className="mb-8 relative">
            <Image
              source={require("@/assets/images/signup-pending.png")}
              style={{ width: 280, height: 280 }}
              contentFit="contain"
              className="rounded-full"
            />
          </View>

          {/* 제목 */}
          <View className="w-full mb-4 items-center">
            <Text
              size="lg"
              textColor="black"
              weight="semibold"
              className="text-center"
            >
              회원가입 완료!
            </Text>
            <Text
              size="lg"
              textColor="black"
              weight="normal"
              className="text-center mt-1"
            >
              관리자{" "}
              <Text size="lg" textColor="purple" weight="semibold">
                승인
              </Text>
              을 기다리고 있어요
            </Text>
          </View>

          {/* 설명 */}
          <View className="w-full mb-8 items-center">
            <Text
              size="sm"
              textColor="pale-purple"
              weight="light"
              className="text-center"
            >
              승인되면 푸시로 알려드릴게요
            </Text>
          </View>

          {/* 승인 대기 카드 */}
          <View className="w-full mb-8">
            <View className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center mr-3">
                  <Text size="12" textColor="white" weight="bold">
                    ⏱
                  </Text>
                </View>
                <View className="flex-1">
                  <Text
                    size="md"
                    textColor="dark"
                    weight="semibold"
                    className="mb-1"
                  >
                    승인 대기
                  </Text>
                  <Text size="sm" textColor="gray" weight="light">
                    관리자 승인까지 2~12시간 소요됩니다
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View className="w-full px-6 pb-8">
        <Button
          variant="primary"
          size="md"
          onPress={handleGoToLogin}
          className="w-full py-4 rounded-2xl"
        >
          로그인 화면으로 돌아가기
        </Button>
      </View>
    </DefaultLayout>
  );
}
