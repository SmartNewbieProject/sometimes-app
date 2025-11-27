import SmallTitleIcon from "@/assets/icons/small-title.svg";
import { semanticColors } from '../../../../shared/constants/colors';
import { DefaultLayout } from "@/src/features/layout/ui";
import { Button, PalePurpleGradient, Text } from "@/src/shared/ui";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, View , Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useConfirmProfileImageReview } from "@/src/features/mypage/hooks/use-confirm-profile-image-review";

export default function ProfileImgEditRejectScreen() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const rejectionReason =
    (params.rejectionReason as string) || "승인이 거절되었습니다.";

  const { mutateAsync, isPending } = useConfirmProfileImageReview();

  const handleReapply = async () => {
    try {
      await mutateAsync();
      router.push({ pathname: "/profile-edit/profile" });
    } catch (e) {}
  };

  const handleContactSupport = () => {
    Linking.openURL(
      "https://www.instagram.com/sometime.in.univ?igsh=MTdxMWJjYmFrdGc3Ng=="
    );
  };

  return (
    <DefaultLayout className="flex-1 flex flex-col w-full items-center">
      <PalePurpleGradient />

      <ScrollView
        className="flex-1 w-full"
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top }}
      >
        <View className="flex-1 items-center px-6 pb-12">
          {/* SOMETIME 로고 */}
          <View className="mt-[10px] mb-[28px]">
            <SmallTitleIcon width={160} height={40} />
          </View>
          {/* 메인 이미지 */}
          <View className="items-center  relative ">
            <View style={{ position: "absolute", left: 0 }}>
              <View
                style={{
                  width: 253,
                  height: 253,
                  borderRadius: 253,
                  top: 0,
                  left: 0,

                  backgroundColor: semanticColors.brand.primary,
                  position: "absolute",
                }}
              />
              <View
                style={{
                  width: 193,
                  height: 193,
                  borderRadius: 223,

                  backgroundColor: semanticColors.surface.background,
                  top: 30,
                  left: 30,
                  position: "absolute",
                }}
              />
              <View
                style={{
                  width: 30,
                  height: 196,
                  top: 30,
                  left: 111.5,
                  transform: [
                    {
                      rotate: "-45deg",
                    },
                  ],
                  backgroundColor: semanticColors.brand.primary,
                  position: "absolute",
                }}
              />
            </View>

            <Image
              source={require("@assets/images/limit-age.png")}
              style={{ width: 259, height: 259, top: 30, left: 30 }}
              className="mb-6"
            />
          </View>

          {/* 제목 */}
          <View className="w-full mb-4">
            <Text
              size="lg"
              textColor="black"
              weight="semibold"
              className="text-left"
            >
              승인이 거절되었어요
            </Text>
          </View>

          {/* 설명 */}
          <View className="w-full mb-8">
            <Text
              size="md"
              textColor="pale-purple"
              weight="light"
              className="text-left leading-6"
            >
              아래 사유를 확인하고 정보를 수정한 후{"\n"}
              다시 신청해주세요
            </Text>
          </View>

          {/* 거절 사유 카드 */}
          <View className="w-full mb-8">
            <View className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center mr-3">
                  <Text size="12" textColor="white" weight="bold">
                    !
                  </Text>
                </View>
                <View className="flex-1">
                  <Text
                    size="md"
                    textColor="dark"
                    weight="semibold"
                    className="mb-1"
                  >
                    거절 사유
                  </Text>
                  <Text size="sm" textColor="gray" weight="light">
                    {rejectionReason}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 안내 텍스트 */}
          <Text
            size="sm"
            textColor="gray"
            weight="light"
            className="text-center mt-8"
          >
            정보를 수정하신 후 언제든지 다시 신청하실 수 있어요
          </Text>
        </View>
      </ScrollView>

      {/* 하단 버튼들 */}
      <View className="w-full px-6 pb-8 gap-1 space-y-3">
        <Button
          variant="primary"
          size="md"
          onPress={handleReapply}
          className="w-full py-4 rounded-2xl"
        >
          <View className="flex-row items-center justify-center">
            <Text
              size="md"
              textColor="white"
              weight="semibold"
              className="mr-2"
            >
              ↻
            </Text>
            <Text size="md" textColor="white" weight="semibold">
              다시 입력하기
            </Text>
          </View>
        </Button>

        <Button
          variant="secondary"
          size="md"
          onPress={handleContactSupport}
          className="w-full py-4 rounded-2xl bg-surface-background border border-gray-300"
        >
          <View className="flex-row items-center justify-center">
            <Text size="md" textColor="gray" weight="medium" className="mr-2">
              🎧
            </Text>
            <Text size="md" textColor="gray" weight="medium">
              고객센터 문의
            </Text>
          </View>
        </Button>
      </View>
    </DefaultLayout>
  );
}
