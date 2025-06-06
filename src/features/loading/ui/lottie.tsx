import { View } from "react-native";
import { Text } from "@shared/ui";

type Props = {
  title: string;
  loading: boolean;
  children: React.ReactNode;
};

const Lottie: React.FC<Props> = ({ title, loading, children, ...props }) => {
  if (loading) {
    return (
      <View className="w-full flex flex-col items-center justify-center">
        <Text variant="primary" size="sm" textColor="pale-purple">
          {title}
        </Text>
        <View className="hidden">
          {children}
        </View>
      </View>
    );
  }

  return children;
}

export default Lottie;
