import { Header, Text, PalePurpleGradient , Button, ImageSelector } from "@/src/shared/ui";
import { semanticColors } from '../../src/shared/constants/colors';
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Alert,
  Dimensions,
  Easing,
  StyleSheet,
  Text as RNText,
  View,
  Pressable,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { DefaultLayout } from "@/src/features/layout/ui";
import ChevronLeftIcon from "@/assets/icons/chevron-left.svg";
import { useModal } from "@/src/shared/hooks/use-modal";
import {
  GuideView,
  guideHeight,
  useOverlay,
 OverlayProvider } from "@/src/shared/hooks/use-overlay";
import Loading from "@/src/features/loading";
import { useVerification } from "@/src/features/university-verification/hooks/use-id-verification";

const { height } = Dimensions.get("window");

export default function StudentVerifyPage() {
  const { showErrorModal } = useModal();
  const { showModal } = useModal();
  const { showOverlay, visible } = useOverlay();
  const animation = useRef(new Animated.Value(0)).current;

  const [image, setImage] = useState<string | null>(null);
  const { submitOne, submitting } = useVerification();

  const nextable = !!image;

  const onSubmit = async () => {
    if (!image) return;

    try {
      const response = await submitOne(image);
      const successMessage =
        response?.message ||
        "파일이 성공적으로 제출되었습니다.\n관리자 검토 후 승인됩니다.";

      showModal({
        title: "제출 완료",
        children: successMessage,
        primaryButton: {
          text: "확인",
          onClick: () => router.replace("/"),
        },
      });
    } catch (e: any) {
      showErrorModal(
        e?.message ||
          "업로드 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        "announcement"
      );
    }
  };

  if (submitting) return <Loading.Page />;

  return (
    <DefaultLayout className="flex-1 relative">
      <PalePurpleGradient />
      <Header.Container>
        <Header.LeftContent>
          <Pressable onPress={() => router.back()} className="p-2 -ml-2">
            <ChevronLeftIcon width={24} height={24} />
          </Pressable>
        </Header.LeftContent>
        <Header.CenterContent>
          <Text size="lg" weight="normal" textColor="black">
            대학 인증
          </Text>
        </Header.CenterContent>
        <Header.RightContent></Header.RightContent>
      </Header.Container>
      <GuideView>
        <View className="px-5">
          <Image
            source={require("@assets/images/profile-image.png")}
            style={{ width: 72, height: 72 }}
          />
          <Text weight="semibold" size="20" textColor="black" className="mt-2">
            재학 인증을 진행해 주세요
          </Text>
          <Text weight="medium" size="sm" textColor="pale-purple">
            학생증 또는 재학증명서 이미지 1장만 업로드해주세요.
          </Text>
          <Text weight="medium" size="sm" textColor="pale-purple">
            (JPG, JPEG, PNG, 10MB 이하)
          </Text>
        </View>

        <View className="px-5 mt-6 items-center">
          <ImageSelector
            size="lg"
            value={image ?? undefined}
            onChange={(v: string) => setImage(v)}
          />
        </View>
      </GuideView>

      <View style={styles.bottom}>
        <Button
          variant="primary"
          size="md"
          disabled={!nextable}
          onPress={onSubmit}
          className="w-full"
        >
          제출하기
        </Button>
      </View>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  infoOverlay: {
    bottom: 180,
    position: "absolute",
    right: 90,
    marginHorizontal: "auto",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: semanticColors.surface.background,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    shadowColor: "#F2ECFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3,
  },
  infoInline: {
    marginHorizontal: "auto",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: semanticColors.surface.background,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    shadowColor: "#F2ECFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3,
  },
  infoTitle: {
    color: semanticColors.brand.accent,
    fontWeight: "600" as any,
    fontFamily: "Pretendard-SemiBold",
    lineHeight: 16.8,
    fontSize: 14,
    marginBottom: 6,
  },
  infoDesc: { fontSize: 11, lineHeight: 13.2, color: "#BAB0D0" },
  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
});
