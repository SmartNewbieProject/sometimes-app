import { IconWrapper } from "@/src/shared/ui/icons";
import { View, StyleSheet } from "react-native";
import LogoIcon from '@/assets/icons/paper-plane.svg';
import SmallTitle from '@/assets/icons/small-title.svg';
import { Text } from "@/src/shared/ui";
import { cn } from "@/src/shared/libs/cn";
import { platform } from "@/src/shared/libs/platform";
import { Image } from "expo-image";


export default function Logo() {
  return (
    <View className={cn(
      "flex flex-col items-center gap-y-2",
      platform({
        ios: () => "pt-[80px]",
        android: () => "pt-[80px]",
        web: () => "",
      })
    )}>
      <View className="p-0 md:p-12">
        <Image
          source={require('@assets/images/paper-plane.png')}
          style={{ width: 128, height: 128 }}
        />
      </View>
      <IconWrapper width={400} className="text-primaryPurple">
        <SmallTitle />
      </IconWrapper>
      <View className="items-center pt-[8px] flex flex-col gap-y-[6px]">
        <Text className="text-[15px] text-primaryPurple">익숙한 하루에 설렘 하나</Text>
      </View>
    </View>
  );
}
