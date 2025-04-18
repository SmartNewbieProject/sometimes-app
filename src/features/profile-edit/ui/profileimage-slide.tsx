import { View, Image } from "react-native";
import { Slide } from "@/src/widgets";
import { Text } from "@/src/shared/ui/text";

export const ProfileImageSlide = () => {
  return (
    <Slide>
      {/* 실제 이미지 슬라이드 */}
      <View className="w-[120px] h-[120px] rounded-2xl overflow-hidden">
        <Image 
          source={require("@assets/images/image.png")} 
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {/* 사진 추가하기 placeholder */}
      <View className="w-[120px] h-[120px] rounded-2xl bg-[#F6F2FF] items-center justify-center">
        <View className="w-10 h-10 rounded-lg bg-[#EEE6FF] items-center justify-center mb-2">
          <Image 
            source={require("@assets/images/image.png")} 
            className="w-6 h-6"
            resizeMode="contain"
          />
        </View>
        <Text size="sm" textColor="purple">사진 추가하기</Text>
      </View>

      {/* 사진 추가하기 placeholder */}
      <View className="w-[120px] h-[120px] rounded-2xl bg-[#F6F2FF] items-center justify-center">
        <View className="w-10 h-10 rounded-lg bg-[#EEE6FF] items-center justify-center mb-2">
          <Image 
            source={require("@assets/images/image.png")} 
            className="w-6 h-6"
            resizeMode="contain"
          />
        </View>
        <Text size="sm" textColor="purple">사진 추가하기</Text>
      </View>
    </Slide>
  );
};