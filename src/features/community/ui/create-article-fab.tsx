import { IconWrapper } from "@shared/ui/icons";
import { router } from "expo-router";
import { TouchableOpacity } from "react-native";
import WriteIcon from '@/assets/icons/write.svg';

export const CreateArticleFAB = () => {
  return (
    <TouchableOpacity
      onPress={() => router.push('/community/write')}
      className="w-[60px] h-[60px] rounded-full bg-[#9747FF] items-center justify-center"
      style={{ position: 'absolute', bottom: 80, right: 16 }}
    >
      <IconWrapper>
        <WriteIcon stroke="#FFFFFF" />
      </IconWrapper>
    </TouchableOpacity>
  );
};
