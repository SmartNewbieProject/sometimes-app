import { IconWrapper } from "@shared/ui/icons";
import { router } from "expo-router";
import { TouchableOpacity } from "react-native";
import WriteIcon from '@/assets/icons/write.svg';
import { useCategory } from "../hooks";

export const CreateArticleFAB = () => {
  const { currentCategory } = useCategory();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/community/write?category=${currentCategory}`)}
      className="w-[60px] h-[60px] rounded-full bg-[#9747FF] items-center justify-center"
      style={{ position: 'absolute', bottom: 80, right: 24 }}
    >
      <IconWrapper>
        <WriteIcon stroke="#FFFFFF" />
      </IconWrapper>
    </TouchableOpacity>
  );
};
