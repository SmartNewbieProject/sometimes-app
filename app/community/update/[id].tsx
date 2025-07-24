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

  const onSubmit = form.handleSubmit(async (data) => {
    await tryCatch(async () => {
      await articles.patchArticle(id, {
        content: data.content,
        title: data.title,
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.articles.detail(id),
      });
      showModal({
        title: "완료",
        children: (
          <View className="flex flex-col gap-y-1">
            <Text textColor="black" size="sm">
              게시글이 수정되었어요!
            </Text>
            <Text textColor="black" size="sm">
              게시글로 이동할게요.
            </Text>
          </View>
        ),
        primaryButton: {
          text: "네, 이동할게요",
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
    });
  }, [status, isFetched]);

  if (isLoading) {
    return <Loading.Page title="게시글을 불러오고 있어요." />;
  }

  return (
    <ArticleWriteFormProvider form={form}>
      <DefaultLayout className="flex-1">
        <PalePurpleGradient />
        <ArtcileWriter.Header mode="update" onConfirm={onSubmit} />
        <ArtcileWriter.Form />
        <ArtcileWriter.Nav mode="update" />
      </DefaultLayout>
    </ArticleWriteFormProvider>
  );
}
