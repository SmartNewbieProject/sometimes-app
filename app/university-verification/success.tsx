import ChevronLeftIcon from "@/assets/icons/chevron-left.svg";
import { Header, PalePurpleGradient, Text } from "@/src/shared/ui";
import { router } from "expo-router";
import { Image, Pressable, TouchableOpacity, View } from "react-native";

export default function UniversityVerificationSuccess() {
  const handleGoToProfile = () => {
    router.push("/home");
  };

  return (
    <View className="flex-1">
      <PalePurpleGradient />
      <Header.Container>
        <Header.LeftContent>
          <Pressable onPress={() => router.back()} className="p-2 -ml-2">
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

      <View className="flex-1 px-5 justify-center items-center relative">
        {/* 메인 이미지 */}
        <View className="mb-16 mt-8 items-center ml-6">
          <Image
            source={require("@/assets/images/verification-done.png")}
            style={{ width: 320, height: 320 }}
            resizeMode="contain"
          />
        </View>

        {/* 메인 텍스트 */}
        <View className="mb-20 w-[80%] items-start">
          <Text size="lg" weight="normal" textColor="black" className="mb-1">
            축하드려요!
          </Text>
          <Text size="lg" weight="normal" textColor="black" className="mb-2">
            대학 인증이 완료되었어요!
          </Text>

          <Text size="sm" weight="normal" className="mb-1 text-[#9B94AB]">
            이제 안심하고 시작해볼까요?
          </Text>
          <Text size="sm" weight="normal" className="text-[#9B94AB]">
            내가 있는 지역에서 이상형을 안전하게 만나보세요!
          </Text>
        </View>

        {/* 하단 버튼 */}
        <View className="absolute bottom-8 left-5 right-5">
          <TouchableOpacity
            onPress={handleGoToProfile}
            className="bg-[#8B5CF6] rounded-2xl py-4 items-center"
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
