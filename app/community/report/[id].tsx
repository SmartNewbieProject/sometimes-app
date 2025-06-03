import { Pressable, View, Alert, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Header, PalePurpleGradient, Text } from "@/src/shared/ui";
import ChevronLeftIcon from "@/assets/icons/chevron-left.svg";
import { ImageResources } from "@/src/shared/libs/image";
import { ImageResource } from "@/src/shared/ui/image-resource";
import Layout from "@/src/features/layout";
import { FormProvider, useForm } from "react-hook-form";
import { Form } from "@/src/widgets";
import { reportArticle } from "@/src/features/community/apis/articles";
import { tryCatch } from "@/src/shared/libs";
import { useModal } from "@/src/shared/hooks/use-modal";
import { createArticlesQueryKey } from "@/src/features/community/queries/use-infinite-articles";  
import { queryClient } from "@/src/shared/config/query";
import { useCategory } from "@/src/features/community/hooks";

type ReportForm = {
  reason: string;
};

export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const form = useForm<ReportForm>({
    mode: 'onTouched',
  });
  const { showErrorModal } = useModal();
  const { currentCategory: categoryCode } = useCategory();

  const onSubmit = form.handleSubmit(async (data) => {
    await tryCatch(async () => {
      await reportArticle(id, data.reason);
      await queryClient.invalidateQueries({ queryKey: createArticlesQueryKey(categoryCode) });
      if (Platform.OS === 'web') {
        window.alert('신고가 완료되었어요.\n관리자가 검토 후 적절한 조치를 취하겠습니다.\n해당 게시글은 회원님에게 노출되지 않습니다.');
      } else {
        Alert.alert('신고가 완료되었어요.', '관리자가 검토 후 적절한 조치를 취하겠습니다.\n해당 게시글은 회원님에게 노출되지 않습니다.');
      }
      router.navigate('/community?refresh=true');
    }, ({ error }) => {
      showErrorModal(error, 'error');
    });
  });

  return (
    <Layout.Default>
      <PalePurpleGradient />
      <HeaderComponent />
      <View className="flex-1 px-5">
        <ImageResource resource={ImageResources.REPORT} width={152} height={182} />
        <Text textColor="deepPurple" size="20" weight="bold">
          부적절한 게시글을 발견하셨나요?
        </Text>
        <Text textColor="gray" size="md" weight="medium" className="mt-1.5">
          신고해주신 내용은 관리자가 검토 후 적절한 조치를 취하겠습니다.
        </Text>

        <View className="flex-1 mt-4 mr-4">
          <FormProvider {...form}>
            <Form.Select name="reason" options={
              reportReasons.map((reason) => ({
                label: reason,
                value: reason,
              }))
            } />
          </FormProvider>
        </View>
      </View>

      <View className="mb-14 px-5">
        <Button 
          className="w-full"
          disabled={!form.formState.isValid}
          onPress={onSubmit}
        >
          신고하기
        </Button>
      </View>
    </Layout.Default>
  )
}

const HeaderComponent = () => (
  <Header.Container>
    <Header.LeftContent>
      <Pressable onPress={() => router.back()}>
        <ChevronLeftIcon width={24} height={24} />
      </Pressable>
    </Header.LeftContent>

    <Header.CenterContent className="pr-10">
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
