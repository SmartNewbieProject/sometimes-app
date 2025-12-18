// community/write.tsx
import Community from "@/src/features/community";
import type { ArticleRequestType } from "@/src/features/community/types";
import { DefaultLayout } from "@/src/features/layout/ui";
import { useModal } from "@/src/shared/hooks/use-modal";
import { tryCatch } from "@/src/shared/libs";
import { PalePurpleGradient, Text } from "@/src/shared/ui";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { useMemo, useEffect, useState } from "react";
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
  const [initialEventAttempt, setInitialEventAttempt] = useState<number | null>(null);

  const { category: initCategory } = useLocalSearchParams<{
    category: string;
  }>();

  const { currentCategory } = useCategory();

  const initialType = useMemo(
    () => (initCategory || currentCategory) as ArticleRequestType | undefined,
    [initCategory, currentCategory]
  );

  const form = useArticleWriteForm({ type: initialType as ArticleRequestType });

  useEffect(() => {
    const saveInitialEventState = async () => {
      try {
        const { getEventByType } = await import("@/src/features/event/api");
        const { EventType } = await import("@/src/features/event/types");

        const eventDetails = await getEventByType(EventType.COMMUNITY_FIRST_POST);
        setInitialEventAttempt(eventDetails.currentAttempt);
      } catch (error) {
      }
    };

    saveInitialEventState();
  }, []);

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

        communityEngagementEvents.trackArticleCreated(
          articleData.type || '일반',
          !!originalImages && originalImages.length > 0,
          Math.ceil(articleData.content.length / 500)
        );

        await articles.postArticles(articleData);

        try {
          const { storage } = await import("@/src/shared/libs");
          const { my } = await import("@/src/features/auth");
          const auth = my();
          if (auth?.phoneNumber) {
            await storage.setItem(`community-written-post-${auth.phoneNumber}`, "true");
          }
        } catch (error) {
        }

        if (initialEventAttempt !== null) {
          try {
            const { getEventByType } = await import("@/src/features/event/api");
            const { EventType } = await import("@/src/features/event/types");

            const eventDetails = await getEventByType(EventType.COMMUNITY_FIRST_POST);
            const actuallyReceivedReward = eventDetails.currentAttempt > initialEventAttempt;

            if (actuallyReceivedReward) {
              router.push("/community?refresh=true&receivedGemReward=true");
            } else {
              router.push("/community?refresh=true");
            }
          } catch (error) {
            router.push("/community?refresh=true");
          }
        } else {
          router.push("/community?refresh=true");
        }

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
      <DefaultLayout style={styles.container}>
        <ArtcileWriter.Header onConfirm={onSubmitForm} mode="create" />

        <View style={styles.spacer} />

        <ArtcileWriter.Form mode="create" />
        <ArtcileWriter.Nav mode="create" />
      </DefaultLayout>
    </ArticleWriteFormProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  spacer: {
    backgroundColor: semanticColors.surface.background,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
