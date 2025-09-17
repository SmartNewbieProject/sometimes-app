import { TouchableOpacity, Pressable } from "react-native";
import { Header, Text } from "@shared/ui";
import { router } from "expo-router";
import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';
import { useTranslation } from "react-i18next";

type ArticleWriteHeaderProps = {
  onConfirm: () => void;
  mode: 'create' | 'update';
};

export const ArticleWriteHeader = ({ onConfirm, mode }: ArticleWriteHeaderProps) => {
  const { t } = useTranslation();
  return (
    <Header.Container>
      <Header.LeftContent>
        <Pressable onPress={() => router.push('/community')} className="p-2 -ml-2">
          <ChevronLeftIcon width={24} height={24} />
        </Pressable>
      </Header.LeftContent>

      <Header.CenterContent>
        <Text textColor="black" weight="bold" size="18">
          {mode === 'create' ? t("features.community.ui.article_write_screen.header.write_post") : t("features.community.ui.article_write_screen.header.edit_post")}
        </Text>
      </Header.CenterContent>

      <Header.RightContent>
        <TouchableOpacity onPress={onConfirm}>
          <Text textColor={'black'} weight={'bold'}>
            {t("features.community.ui.article_write_screen.header.complete_button")}
          </Text>
        </TouchableOpacity>
      </Header.RightContent>
    </Header.Container>
  );
};
