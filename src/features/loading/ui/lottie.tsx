import React from 'react';
import { View } from "react-native";
import { Lottie as L, LottieProps, Text } from '@shared/ui';

type Props = {
  title: string;
  loading: boolean;
  children: React.ReactNode;
} & LottieProps;

const Lottie: React.FC<Props> = ({ title, loading, children, ...props }) => {
  if (loading) {
    return (
      <View className="w-full flex flex-col items-center justify-center">
        <L {...props} />
        <Text variant="primary" size="sm" textColor="pale-purple">
          {title}
        </Text>
      </View>
    );
  }

  return children;
}

export default Lottie;
