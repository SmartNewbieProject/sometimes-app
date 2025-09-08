// community/write.tsx
import Community from "@/src/features/community";
import type { ArticleRequestType } from "@/src/features/community/types";
import { DefaultLayout } from "@/src/features/layout/ui";
import { useModal } from "@/src/shared/hooks/use-modal";
import { tryCatch } from "@/src/shared/libs";
import { PalePurpleGradient, Text } from "@/src/shared/ui";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { useMemo } from "react";
import { useCategory } from "@/src/features/community/hooks";

const {
  ArticleWriteFormProvider,
  useArticleWriteForm,
  ArtcileWriter,
  articles,
} = Community;

export default function CommunityWriteScreen() {
  const { showModal } = useModal();

  const { category: initCategory } = useLocalSearchParams<{
    category: string;
  }>();

  const { currentCategory } = useCategory();

  const initialType = useMemo(
    () => (initCategory || currentCategory) as ArticleRequestType | undefined,
    [initCategory, currentCategory]
  );

  const form = useArticleWriteForm({ type: initialType as ArticleRequestType });

  const onSubmitForm = form.handleSubmit(async (data) => {
    if (data.title.length < 3 || data.content.length < 3) {
      showModal({
        title: "너무 짧아요",
        children: (
          <Text textColor="black">
            제목과 본문은 3자 이상으로 작성해주세요.
          </Text>
        ),
        primaryButton: { text: "네, 확인했어요", onClick: () => {} },
      });
      return;
    }

    if (data.content.length > 2000) {
      showModal({
        title: "글자수 초과",
        children: (
          <Text textColor="black">본문은 2000자 이하로 작성해주세요.</Text>
        ),
        primaryButton: { text: "네, 확인했어요", onClick: () => {} },
      });
      return;
    }

    await tryCatch(
      async () => {
        const { originalImages, deleteImageIds, ...articleData } = data;
        await articles.postArticles(articleData);

        showModal({
          title: "글 작성 완료",
          children: <Text textColor="black">글 작성이 완료되었습니다.</Text>,
          primaryButton: {
            text: "확인",
            onClick: () => {
              router.push("/community?refresh=true");
            },
          },
        });
      },
      (error) => {
        const errorMessage =
          (error as any)?.error || "글 작성 중 오류가 발생했습니다.";
        showModal({
          title: "글 작성 실패",
          children: <Text textColor="black">{errorMessage}</Text>,
          primaryButton: { text: "확인", onClick: () => {} },
        });
      }
    );
  });

  return (
    <ArticleWriteFormProvider form={form}>
      <DefaultLayout className="flex-1">
        <PalePurpleGradient />
        <ArtcileWriter.Header onConfirm={onSubmitForm} mode="create" />

        <View className="bg-white px-4 pt-3" />

        <ArtcileWriter.Form />
        <ArtcileWriter.Nav mode="create" />
      </DefaultLayout>
    </ArticleWriteFormProvider>
  );
}
