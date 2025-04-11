import { IconWrapper } from "@/src/shared/ui/icons";
import { View, StyleSheet } from "react-native";
import LogoIcon from '@/assets/icons/paper-plane.svg';
import SmallTitle from '@/assets/icons/small-title.svg';
import { Text } from "@/src/shared/ui";

const styles = StyleSheet.create({
  shadowText: {
    textShadowColor: '#A9A9A9',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default function Logo() {
  return (
    <View className="flex flex-col items-center gap-y-2">
    <IconWrapper width={128} className="text-primaryPurple pb-[24px] md:pb-[58px]">
      <SmallTitle />
    </IconWrapper>
    <View className="bg-primaryPurple rounded-full p-4">
      <IconWrapper size={128} className="text-white">
        <LogoIcon />
      </IconWrapper>
    </View>
    <View className="items-center pt-[8px] flex flex-col gap-y-[6px]">
      <Text className="text-[25px] font-semibold text-black">익숙한 하루에 설렘 하나,</Text>
        <Text className="text-[15px] text-[#4F4F4F]" style={styles.shadowText}>SOMETIME에서</Text>
      </View>
    </View>
  );
}
