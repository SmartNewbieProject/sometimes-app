import { StyleSheet, TouchableOpacity, Pressable } from "react-native";
import { Header, Text } from "@shared/ui";
import { router } from "expo-router";
import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';

type ArticleWriteHeaderProps = {
  onConfirm: () => void;
  mode: 'create' | 'update';
};

export const ArticleWriteHeader = ({ onConfirm, mode }: ArticleWriteHeaderProps) => {
  return (
    <Header.Container>
      <Header.LeftContent>
        <Pressable onPress={() => router.push('/community')} style={styles.backButton}>
          <ChevronLeftIcon width={24} height={24} />
        </Pressable>
      </Header.LeftContent>

      <Header.CenterContent>
        <Text textColor="black" weight="bold" size="18">
          {mode === 'create' ? '글 쓰기' : '글 수정'}
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

const styles = StyleSheet.create({
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
});
