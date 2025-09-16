import ChevronLeftIcon from "@/assets/icons/chevron-left.svg";
import { useAuth } from "@/src/features/auth";
import apis from "@/src/features/community/apis";
import { useArticleDetail } from "@/src/features/community/hooks";
import type { Article } from "@/src/features/community/types";
import { ArticleDetail } from "@/src/features/community/ui/article-detail/article-detail";
import { DefaultLayout } from "@/src/features/layout/ui";
import Loading from "@/src/features/loading";
import { useBoolean } from "@/src/shared/hooks/use-boolean";
import { Header, Show, Text } from "@/src/shared/ui";
import { Dropdown, type DropdownItem } from "@/src/shared/ui/dropdown";
import { router, useLocalSearchParams } from "expo-router";
import type React from "react";
import { useCallback, useEffect, useMemo } from "react";
import { Linking } from "react-native";
import { KeyboardAvoidingView, Platform, Pressable, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

interface ArticleHeaderProps {
  isOwner: boolean;
  dropdownOpen: boolean;
  dropdownItems: DropdownItem[];
  t: (key: string) => string;
}

const ArticleHeader: React.FC<ArticleHeaderProps> = ({
  isOwner,
  dropdownOpen,
  dropdownItems,
  t,
}) => (
  <Header.Container className=" items-center">
    <Header.LeftContent>
      <Pressable
        onPress={() => router.push("/community")}
        className="p-2 -ml-2"
      >
        <ChevronLeftIcon width={24} height={24} />
      </Pressable>
      <Header.LeftButton visible={false} />
    </Header.LeftContent>
    <Header.Logo title={t("apps.community.id.header_title")} showLogo={true} logoSize={128} />
    <Header.RightContent>
      <Show when={isOwner}>
        <Dropdown open={dropdownOpen} items={dropdownItems} />
      </Show>
    </Header.RightContent>
  </Header.Container>
);

export default function ArticleDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { article, isLoading, error } = useArticleDetail(id);
  const {
    value: isDropdownOpen,
    toggle: toggleDropdown,
    setFalse: closeDropdown,
  } = useBoolean();
  const { my } = useAuth();

  useEffect(() => {
    if (!my?.id) {
      Linking.openURL("https://info.some-in-univ.com");
      router.navigate("/community");
      return;
    }
  }, [my?.id]);
  const isValidArticle = (article: Article | undefined): article is Article => {
    return !!article && !!article.author;
  };

  const isOwner = useMemo(() => {
    if (!my || !isValidArticle(article)) return false;
    return my.id === article.author.id;
  }, [my, article]);

  const handleDelete = useCallback(async () => {
    if (!id) return;

    try {
      await apis.articles.deleteArticle(id);
      router.push("/community");
    } catch (error) {
      console.error("Failed to delete article:", error);
    }
  }, [id]);

  const handleEdit = useCallback(() => {
    if (id) {
      router.push(`/community/update/${id}`);
    }
  }, [id]);

  const dropdownItems: DropdownItem[] = useMemo(
    () => [
      {
        key: "edit",
        content: <Text textColor="black">{t("apps.community.id.dropdown_edit")}</Text>,
        onPress: handleEdit,
      },
      {
        key: "delete",
        content: <Text textColor="black">{t("apps.community.id.dropdown_delete")}</Text>,
        onPress: handleDelete,
      },
    ],
    [handleEdit, handleDelete]
  );

  if (!id) {
    return <Loading.Page title="잘못된 요청입니다" />;
  }

  if (error) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text>{t("apps.community.id.error_loading")}</Text>
      </View>
    );
  }

  if (isLoading || !isValidArticle(article)) {
    return <Loading.Page title={t("apps.community.id.loading")} />;
  }
  return (
    <DefaultLayout
      style={{ paddingBottom: insets.bottom }}
      className="flex-1 bg-white "
    >
      <ArticleHeader
        isOwner={isOwner}
        dropdownOpen={isDropdownOpen}
        dropdownItems={dropdownItems}
        t={t}
      />

      <View className="flex-1">
        <ArticleDetail article={article} />
      </View>
    </DefaultLayout>
  );
}
