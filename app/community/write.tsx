import { View } from "react-native";
import { PalePurpleGradient, Text } from "@/src/shared/ui";
import { tryCatch } from "@/src/shared/libs";
import Community from "@/src/features/community";
import { router, useLocalSearchParams } from 'expo-router';
import { ArticleRequestType } from "@/src/features/community/types";
import { useModal } from "@/src/shared/hooks/use-modal";

const { ArticleWriteFormProvider, useArticleWriteForm, ArtcileWriter, articles } = Community;

export default function CommunityWriteScreen() {
  const { showModal } = useModal();
  const { category } = useLocalSearchParams<{ category: string }>();
  const form = useArticleWriteForm({ type: category as ArticleRequestType });

  const onSubmitForm = form.handleSubmit(async (data) => {
    if (data.title.length < 3 || data.content.length < 3) {
      showModal({
        title: '너무 짧아요',
        children: (
          <Text textColor="black">
            제목과 본문은 3자 이상으로 작성해주세요.
          </Text>
        ),
        primaryButton: {
          text: '네, 확인했어요',
          onClick: () => { },
        },
      });
      return;
    }

    await tryCatch(async () => {
      await articles.postArticles(data);
      showModal({
        title: '글 작성 완료',
        children: (
          <Text textColor="black">
            글 작성이 완료되었습니다.
          </Text>
        ),
        primaryButton: {
          text: '확인',
          onClick: () => {
            router.push('/community?refresh=true');
          },
        },
      });
    });
  });

  return (
    <ArticleWriteFormProvider form={form}>
      <View className="flex-1">
        <PalePurpleGradient />
        <ArtcileWriter.Header onConfirm={onSubmitForm} mode="create" />
        <ArtcileWriter.Form />
        <ArtcileWriter.Nav mode="create" />
      </View>
    </ArticleWriteFormProvider>
  );
}
