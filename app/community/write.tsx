import Community from "@/src/features/community";
import type { ArticleRequestType } from "@/src/features/community/types";
import { DefaultLayout } from "@/src/features/layout/ui";
import { useModal } from "@/src/shared/hooks/use-modal";
import { tryCatch } from "@/src/shared/libs";
import { PalePurpleGradient, Text } from "@/src/shared/ui";
import { router, useLocalSearchParams } from "expo-router";
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
  const { category } = useLocalSearchParams<{ category: string }>();
  const form = useArticleWriteForm({ type: category as ArticleRequestType });

  const onSubmitForm = form.handleSubmit(async (data) => {
    if (data.title.length < 3 || data.content.length < 3) {
      showModal({
        title: t("apps.community.write.modal_short_title"),
        children: (
          <Text textColor="black">
            {t("apps.community.write.modal_short_desc")}
          </Text>
        ),
                primaryButton: {
          text: t("apps.community.write.modal_confirm_checked"),
          onClick: () => {},
        },
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
        const errorMessage = error?.error || t("apps.community.write.modal_fail_desc_default");
        showModal({
          title: t("apps.community.write.modal_fail_title"),
          children: <Text textColor="black">{errorMessage}</Text>,
          primaryButton: {
            text:  t("global.confirm"),
            onClick: () => {},
          },
        });
      }
    );
  });

  return (
    <ArticleWriteFormProvider form={form}>
      <DefaultLayout className="flex-1">
        <PalePurpleGradient />
        <ArtcileWriter.Header onConfirm={onSubmitForm} mode="create" />
        <ArtcileWriter.Form />
        <ArtcileWriter.Nav mode="create" />
      </DefaultLayout>
    </ArticleWriteFormProvider>
  );
}
