import ChevronLeftIcon from "@/assets/icons/chevron-left.svg";
import { useAuth } from "@/src/features/auth";
import apis from "@/src/features/community/apis";
import { useArticleDetail } from "@/src/features/community/hooks";
import type { Article } from "@/src/features/community/types";
import { ArticleDetail } from "@/src/features/community/ui/article-detail/article-detail";
import { DefaultLayout } from "@/src/features/layout/ui";
import Loading from "@/src/features/loading";
import { useBoolean } from "@/src/shared/hooks/use-boolean";
import { Header, Show, Text, HeaderWithNotification } from "@/src/shared/ui";
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

interface ArticleHeaderProps {
  isOwner: boolean;
  dropdownOpen: boolean;
  dropdownItems: DropdownItem[];
}

const ArticleHeader: React.FC<ArticleHeaderProps> = ({
  isOwner,
  dropdownOpen,
  dropdownItems,
}) => (
  <HeaderWithNotification
    centerContent={<Text weight="bold">커뮤니티</Text>}
    rightContent={
      <Show when={isOwner}>
        <Dropdown open={dropdownOpen} items={dropdownItems} />
      </Show>
    }
  />
);

export default function ArticleDetailScreen() {
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
        content: <Text textColor="black">수정</Text>,
        onPress: handleEdit,
      },
      {
        key: "delete",
        content: <Text textColor="black">삭제</Text>,
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
        <Text>게시글을 불러오는 중 오류가 발생했습니다.</Text>
      </View>
    );
  }

  if (isLoading || !isValidArticle(article)) {
    return <Loading.Page title="게시글을 불러오고 있어요" />;
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
      />

      <View className="flex-1">
        <ArticleDetail article={article} />
      </View>
    </DefaultLayout>
  );
}
