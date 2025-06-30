import { View } from "react-native";
import { Divider, Text } from "@/src/shared/ui";

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

const Container = ({ title, children }: SectionProps) => {
  return (
    <View className="w-full flex flex-col">
      <View className="w-full flex flex-col mb-2">
        <Text size="18" textColor="black">
          {title}
        </Text>
        <Divider.Horizontal className="my-1" />
      </View>

      <View className="flex flex-col gap-y-2">
        {children}
      </View>
    </View>
  );
};

type ProfileProps = {
  title: string;
  children: React.ReactNode;
};

const Profile = ({ title, children }: ProfileProps) => {
  return (
    <View className="flex flex-row justify-between items-center">
      <Text textColor="black" size="md">{title}</Text>
      {children}
    </View>
  );
};

export const Section = {
  Container,
  Profile,
}
