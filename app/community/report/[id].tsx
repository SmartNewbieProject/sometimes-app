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
import { semanticColors } from "@/src/shared/constants/colors";
import { router, useLocalSearchParams } from "expo-router";
import { FormProvider, useForm } from "react-hook-form";
import { Alert, Platform, Pressable, View, StyleSheet } from "react-native";

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

  const onSubmit = form.handleSubmit(async (data) => {
    await tryCatch(
      async () => {
        await reportArticle(id, data.reason);
        await queryClient.invalidateQueries({
          queryKey: createArticlesQueryKey(categoryCode),
        });
        if (Platform.OS === "web") {
          window.alert(
            "신고가 완료되었어요.\n관리자가 검토 후 적절한 조치를 취하겠습니다.\n해당 게시글은 회원님에게 노출되지 않습니다."
          );
        } else {
          Alert.alert(
            "사용자 차단이 완료되었어요.",
            "해당 사용자의 모든 게시글과 댓글이 더 이상 보이지 않습니다."
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
      <HeaderComponent />

      <View style={styles.contentContainer}>
        <ImageResource
          resource={ImageResources.REPORT}
          width={152}
          height={182}
        />
        <Text textColor="deepPurple" size="20" weight="bold">
          부적절한 게시글을 발견하셨나요?
        </Text>
        <Text textColor="gray" size="md" weight="medium" style={styles.description}>
          신고해주신 내용은 관리자가 검토 후 적절한 조치를 취하겠습니다.
        </Text>

        <View style={styles.formContainer}>
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

      <View style={styles.buttonContainer}>
        <Button
          style={styles.button}
          disabled={!form.formState.isValid}
          onPress={onSubmit}
        >
          신고하기
        </Button>
      </View>
    </Layout.Default>
  );
}

const HeaderComponent = () => (
  <Header.Container>
    <Header.LeftContent>
      <Pressable onPress={() => router.back()}>
        <ChevronLeftIcon width={24} height={24} />
      </Pressable>
    </Header.LeftContent>

    <Header.CenterContent style={styles.headerCenter}>
      <Text textColor="black" weight="bold">
        신고하기
      </Text>
    </Header.CenterContent>
  </Header.Container>
);

const reportReasons = [
  "스팸/도배성 게시글",
  "욕설/혐오표현",
  "성적/선정적 내용",
  "개인정보 노출/사생활 침해",
  "상업적 광고/홍보",
  "부적절한 이미지",
  "괴롭힘/협박",
  "커뮤니티 규칙 위반",
];

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  description: {
    marginTop: 6,
  },
  formContainer: {
    flex: 1,
    marginTop: 16,
    marginRight: 16,
  },
  buttonContainer: {
    marginBottom: 56,
    paddingHorizontal: 20,
  },
  button: {
    width: '100%',
  },
  headerCenter: {
    paddingRight: 40,
  },
});
