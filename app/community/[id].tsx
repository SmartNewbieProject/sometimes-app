import ChevronLeftIcon from "@/assets/icons/chevron-left.svg";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { useAuth } from "@/src/features/auth";
import apis from "@/src/features/community/apis";
import { useArticleDetail } from "@/src/features/community/hooks";
import type { Article } from "@/src/features/community/types";
import { ArticleDetail } from "@/src/features/community/ui/article-detail/article-detail";
import { DefaultLayout } from "@/src/features/layout/ui";
import Loading from "@/src/features/loading";
import { useBoolean } from "@/src/shared/hooks/use-boolean";
import { useModal } from "@/src/shared/hooks/use-modal";
import { Header, Show, Text, HeaderWithNotification } from "@/src/shared/ui";
import { Dropdown, type DropdownItem } from "@/src/shared/ui/dropdown";
import { router, useLocalSearchParams } from "expo-router";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useMixpanel } from "@/src/shared/hooks/use-mixpanel";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from "react-native";
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
  const { showModal } = useModal();
  const { communityEvents } = useMixpanel();
  const viewStartTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!my?.id) {
      showModal({
        title: t("apps.community.id.login_required_title"),
        children: <Text textColor="black">{t("apps.community.id.login_required_description")}</Text>,
        primaryButton: {
          text: t("apps.community.id.login_required_confirm"),
          onClick: () => router.replace("/auth/login"),
        },
        secondaryButton: {
          text: t("apps.community.id.login_required_cancel"),
          onClick: () => router.back(),
        },
      });
      return;
    }
  }, [my?.id]);

  useEffect(() => {
    if (!id || !article) return;

    viewStartTimeRef.current = Date.now();

    return () => {
      const viewDuration = Math.floor((Date.now() - viewStartTimeRef.current) / 1000);
      communityEvents.trackPostViewed(id, viewDuration);
    };
  }, [id, article, communityEvents]);
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
    return <Loading.Page title={t("apps.community.id.error_invalid")} />;
  }

  if (error) {
    console.error('[Community] Failed to load article:', { id, error });
    return (
      <DefaultLayout style={styles.container}>
        <HeaderWithNotification
          centerContent={<Text weight="bold">{t("apps.community.id.header_title")}</Text>}
        />
        <View style={styles.errorContainer}>
          <Text textColor="black" weight="semibold" style={{ marginBottom: 8 }}>
            {t("apps.community.id.error_loading")}
          </Text>
          <Text textColor="gray" size="14" style={{ marginBottom: 16 }}>
            {t("apps.community.id.error_not_found")}
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={{
              backgroundColor: semanticColors.brand.primary,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8,
            }}
          >
            <Text textColor="white" weight="semibold">{t("apps.community.id.error_back_button")}</Text>
          </Pressable>
        </View>
      </DefaultLayout>
    );
  }

  if (isLoading || !isValidArticle(article)) {
    return <Loading.Page title={t("apps.community.id.loading")} />;
  }
  return (
    <DefaultLayout style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ArticleHeader
        isOwner={isOwner}
        dropdownOpen={isDropdownOpen}
        dropdownItems={dropdownItems}
        t={t}
      />

      <View style={styles.content}>
        <ArticleDetail article={article} />
      </View>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.background,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: semanticColors.surface.background,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
});
