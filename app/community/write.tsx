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
import { useKpiAnalytics } from "@/src/shared/hooks/use-kpi-analytics";
import { useTranslation } from "react-i18next";

const {
  ArticleWriteFormProvider,
  useArticleWriteForm,
  ArtcileWriter,
  articles,
} = Community;

export default function CommunityWriteScreen() {
  const { t } = useTranslation();
  const { showModal } = useModal();
  const { communityEngagementEvents } = useKpiAnalytics();

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
        title: t("apps.community.write.modal_short_title"),
        children: (
          <Text textColor="black">
            {t("apps.community.write.modal_short_desc")}
          </Text>
        ),
                primaryButton: {text: t("apps.community.write.modal_confirm_checked"),onClick: () => {} },
      });
      return;
    }

    if (data.content.length > 2000) {
      showModal({
        title: t("apps.community.write.modal_overflow_title"),
        children: (
          <Text textColor="black">
            {t("apps.community.write.modal_overflow_desc")}
          </Text>
        ),
                primaryButton: {
          text: t("apps.community.write.modal_confirm_checked"),
          onClick: () => {},
        },
      });
      return;
    }

    await tryCatch(
      async () => {
        const { originalImages, deleteImageIds, ...articleData } = data;

        // 커뮤니티 글 생성 이벤트 추적
        communityEngagementEvents.trackArticleCreated(
          articleData.category || '일반',
          !!originalImages && originalImages.length > 0,
          Math.ceil(articleData.content.length / 500) // 500자당 1분으로 예상 독서 시간
        );

        await articles.postArticles(articleData);

        showModal({
          title: t("apps.community.write.modal_success_title"),
          children: <Text textColor="black">{t("apps.community.write.modal_success_desc")}</Text>,
          primaryButton: {
            text: t("global.confirm"),
            onClick: () => {
              router.push("/community?refresh=true");
            },
          },
        });
      },
      (error) => {
        const errorMessage =
          (error as any)?.error ||  t("apps.community.write.modal_fail_desc_default");
        showModal({
          title: t("apps.community.write.modal_fail_title"),
          children: <Text textColor="black">{errorMessage}</Text>,
          primaryButton: {text:  t("global.confirm"), onClick: () => {} },
        });
      }
    );
  });

  return (
    <ArticleWriteFormProvider form={form}>
      <DefaultLayout className="flex-1">
        <ArtcileWriter.Header onConfirm={onSubmitForm} mode="create" />

        <View className="bg-surface-background px-4 pt-3" />

        <ArtcileWriter.Form mode="create" />
        <ArtcileWriter.Nav mode="create" />
      </DefaultLayout>
    </ArticleWriteFormProvider>
  );
}
