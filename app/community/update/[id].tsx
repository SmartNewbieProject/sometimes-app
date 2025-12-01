import Community from "@/src/features/community";
import { QUERY_KEYS } from "@/src/features/community/queries/keys";
import { DefaultLayout } from "@/src/features/layout/ui";
import Loading from "@/src/features/loading";
import { queryClient } from "@/src/shared/config/query";
import { useModal } from "@/src/shared/hooks/use-modal";
import { tryCatch } from "@/src/shared/libs";
import { PalePurpleGradient, Text } from "@/src/shared/ui";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

const {
  ArticleWriteFormProvider,
  useArticleWriteForm,
  ArtcileWriter,
  articles,
  ArticleRequestType,
  useArticleDetailsQuery,
} = Community;

export default function CommunityUpdateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showModal } = useModal();
  const { article, isLoading, status, isFetched } = useArticleDetailsQuery(id);
  const form = useArticleWriteForm({});
  const { t } = useTranslation();

  const onSubmit = form.handleSubmit(async (data) => {
    if (data.title.length < 3 || data.content.length < 3) {
      showModal({
        title: t("apps.community.update.too_short_title"),
        children: (
          <Text textColor="black">
            {t("apps.community.update.too_short_desc")}
          </Text>
        ),
        primaryButton: {
          text: t("global.confirm_checked"),
          onClick: () => {},
        },
      });
      return;
    }

    if (data.content.length > 2000) {
      showModal({
        title: t("apps.community.update.content_too_long_title"),
        children: (
          <Text textColor="black">
            {t("apps.community.update.content_too_long_desc")}
          </Text>
        ),
        primaryButton: {
          text: t("apps.comunity.update.modal_confirm_checked"),
          onClick: () => {},
        },
      });
      return;
    }

    await tryCatch(async () => {
      const newImages =
        data.images?.filter(
          (img) => !data.originalImages?.some((orig) => orig.imageUrl === img)
        ) || [];

      await articles.patchArticle(id, {
        content: data.content,
        title: data.title,
        images: newImages,
        deleteImageIds: data.deleteImageIds,
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.articles.detail(id),
      });
      showModal({
        title: t("global.success"),
        children: (
          <View className="flex flex-col gap-y-1">
            <Text textColor="black" size="sm">
              {t("apps.community.update.modal_success_desc_1")}
            </Text>
            <Text textColor="black" size="sm">
              {t("apps.community.update.modal_success_desc_2")}
            </Text>
          </View>
        ),
        primaryButton: {
          text: t("apps.community.update.modal_confirm_move"),
          onClick: () => router.push(`/community/${id}`),
        },
      });
    });
  });

  useEffect(() => {
    if (status !== "success" || !isFetched || !article) return;
    form.reset({
      anonymous: true,
      content: article.content,
      title: article.title,
      type: article.category,
      images: article.images?.map((img) => img.imageUrl) || [],
      originalImages: article.images || [],
      deleteImageIds: [],
    });
  }, [status, isFetched, article, form]);

  if (isLoading) {
    return <Loading.Page title={t("apps.community.update.loading")} />;
  }

  return (
    <ArticleWriteFormProvider form={form}>
      <DefaultLayout className="flex-1">
        <PalePurpleGradient />
        <ArtcileWriter.Header mode="update" onConfirm={onSubmit} />
        <ArtcileWriter.Form mode="update" />
        <ArtcileWriter.Nav mode="update" />
      </DefaultLayout>
    </ArticleWriteFormProvider>
  );
}
