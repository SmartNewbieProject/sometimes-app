import ChevronLeftIcon from "@/assets/icons/chevron-left.svg";
import { reportArticle } from "@/src/features/community/apis/articles";
import { useCategory } from "@/src/features/community/hooks";
import { createArticlesQueryKey } from "@/src/features/community/queries/use-infinite-articles";
import Layout from "@/src/features/layout";
import { queryClient } from "@/src/shared/config/query";
import { useModal } from "@/src/shared/hooks/use-modal";
import { tryCatch } from "@/src/shared/libs";
import { ImageResources } from "@/src/shared/libs/image";
import { Button, Header, PalePurpleGradient, Text } from "@/src/shared/ui";
import { ImageResource } from "@/src/shared/ui/image-resource";
import { Form } from "@/src/widgets";
import { router, useLocalSearchParams } from "expo-router";
import { FormProvider, useForm } from "react-hook-form";
import { Alert, Platform, Pressable, View } from "react-native";

import { useTranslation } from "react-i18next";
import i18n from "@/src/shared/libs/i18n";
type ReportForm = {
  reason: string;
};

export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const form = useForm<ReportForm>({
    mode: "onTouched",
  });
  const { showErrorModal } = useModal();
  const { currentCategory: categoryCode } = useCategory();
  const { t } = useTranslation();

  const onSubmit = form.handleSubmit(async (data) => {
    await tryCatch(
      async () => {
        await reportArticle(id, data.reason);
        await queryClient.invalidateQueries({
          queryKey: createArticlesQueryKey(categoryCode),
        });
        if (Platform.OS === "web") {
          window.alert(
            t("apps.community.report.alert_title") + "\n" + t("apps.community.report.alert_desc")
          );
        } else {
                    Alert.alert(
            t("apps.community.report.alert_title"),
            t("apps.community.report.alert_desc")
          );
        }
        router.navigate("/community?refresh=true");
      },
      ({ error }) => {
        showErrorModal(error, "error");
      }
    );
  });

  return (
    <Layout.Default>
      <PalePurpleGradient />
      <HeaderComponent t={t} />

      <View className="flex-1 px-5">
        <ImageResource
          resource={ImageResources.REPORT}
          width={152}
          height={182}
        />
                <Text textColor="deepPurple" size="20" weight="bold">
          {t("apps.community.report.title")}
        </Text>
        <Text textColor="gray" size="md" weight="medium" className="mt-1.5">
          {t("apps.community.report.desc")}
        </Text>

        <View className="flex-1 mt-4 mr-4">
          <FormProvider {...form}>
            <Form.Select
              name="reason"
              options={reportReasons.map((reason) => ({
                label: reason,
                value: reason,
              }))}
            />
          </FormProvider>
        </View>
      </View>

      <View className="mb-14 px-5">
        <Button
          className="w-full"
          disabled={!form.formState.isValid}
          onPress={onSubmit}
        >
          {t("apps.community.report.button")}
        </Button>
      </View>
    </Layout.Default>
  );
}

const HeaderComponent = ({ t }: { t: (key: string) => string }) => (
  <Header.Container>
    <Header.LeftContent>
      <Pressable onPress={() => router.back()}>
        <ChevronLeftIcon width={24} height={24} />
      </Pressable>
    </Header.LeftContent>

    <Header.CenterContent className="pr-10">
      <Text textColor="black" weight="bold">
        {t("apps.community.report.header")}
      </Text>
    </Header.CenterContent>
  </Header.Container>
);

const reportReasons = [
  i18n.t("apps.community.report.reason_spam"),
  i18n.t("apps.community.report.reason_abuse"),
  i18n.t("apps.community.report.reason_sexual"),
  i18n.t("apps.community.report.reason_privacy"),
  i18n.t("apps.community.report.reason_ad"),
  i18n.t("apps.community.report.reason_bullying"),
  i18n.t("apps.community.report.reason_rule"),
];
