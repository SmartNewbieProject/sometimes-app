import { ImageResources } from "@/src/shared/libs";
import { ImageResource, Text } from "@/src/shared/ui";
import { View } from "react-native";

export const NotFound = () => {
  return (
    <View className="w-full h-full flex justify-center items-center">
      <ImageResource
        resource={ImageResources.BROKEN_SANDTIMER}
        width={246}
        height={246}
      />
      <Text textColor="purple" weight="semibold">
        매칭에 실패했어요
      </Text>
    </View>
  );
};
