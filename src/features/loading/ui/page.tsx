import { View } from "react-native";
import { Lottie, PalePurpleGradient, Text } from '@shared/ui';
import { ReactNode } from "react";

type Props = {
  title?: string;
  children?: ReactNode;
  size?: number;
}

export default function PageLoading({ title, children, size = 96 }: Props) {
  return (
    <View className="flex-1 flex flex-col h-screen items-center justify-center">
      <PalePurpleGradient />
      <Lottie size={size} />
      {!!children && children}
      {!children && <Text variant="primary" weight="normal"  textColor="black" size="md" className="text-center mt-4">
        {title}
      </Text>}
    </View>
  );
}