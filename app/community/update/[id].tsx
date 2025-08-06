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
    if (data.title.length < 3 || data.content.length < 3) {
      showModal({
        title: "너무 짧아요",
        children: (
          <Text textColor="black">
            제목과 본문은 3자 이상으로 작성해주세요.
          </Text>
        ),
        primaryButton: {
          text: "네, 확인했어요",
          onClick: () => {},
        },
      });
      return;
    }

    if (data.content.length > 2000) {
      showModal({
        title: "글자수 초과",
        children: (
          <Text textColor="black">
            본문은 2000자 이하로 작성해주세요.
          </Text>
        ),
        primaryButton: {
          text: "네, 확인했어요",
          onClick: () => {},
        },
      });
      return;
    }

    await tryCatch(async () => {
      const newImages = data.images?.filter(img => 
        !data.originalImages?.some(orig => orig.imageUrl === img)
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
      images: article.images?.map(img => img.imageUrl) || [],
      originalImages: article.images || [],
      deleteImageIds: [],
    });
  }, [status, isFetched, article, form]);

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
