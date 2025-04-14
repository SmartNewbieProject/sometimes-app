import { View } from "react-native";
import { Lottie, Text } from '@shared/ui';

export default function PageLoading() {
  return (
    <View className="flex-1 flex flex-col h-full">
      <Lottie />
      <Text variant="primary" weight="semibold" size="lg" className="text-center mt-4">
        로딩중...
      </Text>
    </View>
  )
}