import { View } from "react-native";
import { Lottie, PalePurpleGradient, Text } from '@shared/ui';
import { ReactNode } from "react";

type Props = {
  title?: string;
  children?: ReactNode;
}

export default function PageLoading({ title, children }: Props) {
  return (
    <View className="flex-1 flex flex-col h-screen items-center justify-center">
      <PalePurpleGradient />
      <Lottie size={32} />
      {!!children && children}
      {!children && <Text variant="primary" weight="normal"  textColor="black" size="md" className="text-center mt-4">
        {title}
      </Text>}
    </View>
  );
}