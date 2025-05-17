import type React from "react";
import { useMemo, useCallback } from "react";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { View, Pressable } from "react-native";
import { Header, Show, Text } from "@/src/shared/ui";
import { Dropdown, type DropdownItem } from "@/src/shared/ui/dropdown";
import { ArticleDetail } from "@/src/features/community/ui/article-detail/article-detail";
import ChevronLeftIcon from "@/assets/icons/chevron-left.svg";
import { useArticleDetail } from "@/src/features/community/hooks";
import { useAuth } from "@/src/features/auth";
import { useBoolean } from "@/src/shared/hooks/use-boolean";
import apis from "@/src/features/community/apis";
import Loading from "@/src/features/loading";
import type { Article } from "@/src/features/community/types";

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
  <Header.Container>
    <Header.LeftContent>
      <Pressable onPress={() => router.push("/community")} className="p-2 -ml-2">
        <ChevronLeftIcon width={24} height={24} />
      </Pressable>
      <Header.LeftButton visible={false} />
    </Header.LeftContent>
    <Header.Logo title="커뮤니티" showLogo={true} logoSize={128} />
    <Header.RightContent>
      <Show when={isOwner}>
        <Dropdown
          open={dropdownOpen}
          items={dropdownItems}
        />
      </Show>
    </Header.RightContent>
  </Header.Container>
);

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { article, isLoading, error } = useArticleDetail(id);
  const {
    value: isDropdownOpen,
    toggle: toggleDropdown,
    setFalse: closeDropdown,
  } = useBoolean();
  const { my  } = useAuth();


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

  const dropdownItems: DropdownItem[] = useMemo(() => [
    {
      key: 'edit',
      content: <Text textColor="black">수정</Text>,
      onPress: handleEdit,
    },
    {
      key: 'delete',
      content: <Text textColor="black">삭제</Text>,
      onPress: handleDelete,
    },
  ], [handleEdit, handleDelete]);

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
    <View className="flex-1 relative bg-white">
      <ArticleHeader
        isOwner={isOwner}
        dropdownOpen={isDropdownOpen}
        dropdownItems={dropdownItems}
      />

      <View className="flex-1">
        <ArticleDetail article={article} />
      </View>
    </View>
  );
}
