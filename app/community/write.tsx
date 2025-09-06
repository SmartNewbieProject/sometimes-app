// community/write.tsx
import Community from "@/src/features/community";
import type { ArticleRequestType } from "@/src/features/community/types";
import { DefaultLayout } from "@/src/features/layout/ui";
import { useModal } from "@/src/shared/hooks/use-modal";
import { tryCatch } from "@/src/shared/libs";
import { PalePurpleGradient, Text } from "@/src/shared/ui";
import { router, useLocalSearchParams } from "expo-router";
import { View, TouchableOpacity } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useCategory } from "@/src/features/community/hooks";
import ChevronDown from "@/assets/icons/chevron-left.svg";

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

  const { categories, currentCategory, changeCategory } = useCategory();

  const initialType = (initCategory || currentCategory) as
    | ArticleRequestType
    | undefined;
  const [selectedCategory, setSelectedCategory] = useState<
    ArticleRequestType | undefined
  >(initialType);

  const form = useArticleWriteForm({ type: initialType as ArticleRequestType });

  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      const first = categories[0]?.code as ArticleRequestType | undefined;
      setSelectedCategory(first);
      form.setValue("type", first as any);
      if (first) changeCategory(first);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  const handlePick = (code: string) => {
    const next = code as ArticleRequestType;
    setSelectedCategory(next);
    form.setValue("type", next as any, {
      shouldDirty: true,
      shouldValidate: true,
    });
    changeCategory(next);
  };

  const displayName = useMemo(() => {
    const found = categories.find((c) => c.code === selectedCategory);
    return found?.displayName ?? "카테고리";
  }, [categories, selectedCategory]);

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
        const payload = {
          ...articleData,
          type: selectedCategory,
        } as typeof articleData;
        await articles.postArticles(payload);

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
        <View className="bg-white px-4 pt-3">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => {
                showModal({
                  title: "카테고리 선택",
                  children: (
                    <View className="mt-2">
                      {categories.map((c) => (
                        <TouchableOpacity
                          key={c.code}
                          className="py-3"
                          onPress={() => {
                            handlePick(c.code);
                          }}
                        >
                          <Text
                            textColor={
                              c.code === selectedCategory
                                ? "deepPurple"
                                : "black"
                            }
                          >
                            {c.displayName}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ),
                  primaryButton: { text: "닫기", onClick: () => {} },
                });
              }}
              className="flex-row items-center mr-3 px-2 py-1 rounded-md bg-[#F3F0FF]"
            >
              <Text size="sm" weight="bold" textColor="deepPurple">
                {displayName}
              </Text>
              <ChevronDown style={{ marginLeft: 6 }} />
            </TouchableOpacity>

            <View className="flex-1" />
          </View>
        </View>

        <ArtcileWriter.Form />

        <ArtcileWriter.Nav mode="create" />
      </DefaultLayout>
    </ArticleWriteFormProvider>
  );
}
