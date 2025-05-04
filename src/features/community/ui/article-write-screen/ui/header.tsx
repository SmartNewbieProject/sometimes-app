import { TouchableOpacity, Pressable } from "react-native";
import { Header, Text } from "@shared/ui";
import { router } from "expo-router";
import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';

type ArticleWriteHeaderProps = {
  onConfirm: () => void;
};

export const ArticleWriteHeader = ({ onConfirm }: ArticleWriteHeaderProps) => {
  return (
    <Header.Container>
      <Header.LeftContent>
        <Pressable onPress={() => router.push('/community')} className="p-2 -ml-2">
          <ChevronLeftIcon width={24} height={24} />
        </Pressable>
      </Header.LeftContent>

      <Header.CenterContent>
        <Text textColor="black" weight="bold" size="18">
          글 쓰기
        </Text>
      </Header.CenterContent>

      <Header.RightContent>
        <TouchableOpacity onPress={onConfirm}>
          <Text textColor={'black'} weight={'bold'}>
            완료
          </Text>
        </TouchableOpacity>
      </Header.RightContent>
    </Header.Container>
  );
};
