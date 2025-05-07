import { View } from "react-native";
import { ImageResource, Text } from '@shared/ui';
import { cn, ImageResources } from "@/src/shared/libs";

export const PreOpening = () => {
  return (
    <View
      style={{ position: 'relative', width: '100%', height: '100%', padding: 14 }}
      className="flex flex-col h-full"
    >

      <View className="w-full flex flex-row justify-center items-center mt-[14px]">
        <ImageResource
          resource={ImageResources.PLITE_FOX}
          className="w-[148px] h-[148px] md:w-[238px] md:h-[238px]"
        />
      </View>

      <View className="w-full h-full flex flex-col items-center mt-[20px]">
        <View className="flex flex-col justify-between items-center">
          <Text textColor="deepPurple" weight="semibold" size="20" className="text-[18px] md:text-[22px]">
            설레는 만남을 위해 준비 중이에요.
          </Text>
          <Text weight="semibold" size="18" className="text-[16px] md:text-[18px] mt-1.5">
            곧 다시 찾아올게요&nbsp;💜
          </Text>
        </View>

        <Text textColor="pale-purple" className="text-[12px] md:text-[14px] mt-2 md:mt-8">
          썸타임은 매주 목·일 21시에 매칭이 시작돼요!
        </Text>
      </View>

      <ImageResource
        resource={ImageResources.DISAPPEAR_FOX}
        className={cn([
          "w-[148px] h-[148px] md:w-[238px] md:h-[238px]",
          "absolute bottom-[-24px] left-[-30px] md:left-[-60px]",
          "z-[-1]",
        ])}
        width={238}
        height={238}
      />
    </View>
  )
};
