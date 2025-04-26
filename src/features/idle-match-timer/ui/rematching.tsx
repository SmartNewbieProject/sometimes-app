import { ImageResources } from "@/src/shared/libs";
import { ImageResource, Text } from "@/src/shared/ui";
import { View } from "react-native";

export const RematchLoading = () => {
  return (
    <View className="w-full h-full flex justify-center items-center">
      <ImageResource
        resource={ImageResources.SANDTIMER}
        width={246}
        height={246}
      />
      <Text textColor="purple" weight="semibold">
        잠시만 기다려주세요
      </Text>
      <Text textColor="purple" weight="semibold">
        재매칭권을 사용하고 있어요...
      </Text>
    </View>
  );
};
