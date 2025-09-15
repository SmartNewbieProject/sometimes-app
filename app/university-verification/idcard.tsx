import { Header, Text, PalePurpleGradient } from "@/src/shared/ui";
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
import { Button, ImageSelector } from "@/src/shared/ui";
import ChevronLeftIcon from "@/assets/icons/chevron-left.svg";
import { useModal } from "@/src/shared/hooks/use-modal";
import {
  GuideView,
  guideHeight,
  useOverlay,
} from "@/src/shared/hooks/use-overlay";
import Loading from "@/src/features/loading";
import { useVerification } from "@/src/features/university-verification/hooks/use-id-verification";
import { OverlayProvider } from "@/src/shared/hooks/use-overlay";

const { height } = Dimensions.get("window");

export default function StudentVerifyPage() {
  const { showErrorModal } = useModal();
  const { showModal } = useModal();
  const { showOverlay, visible } = useOverlay();
  const animation = useRef(new Animated.Value(0)).current;

  const [image, setImage] = useState<string | null>(null);
  const { submitOne, submitting } = useVerification();

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.delay(height <= guideHeight ? 500 : 0),
        Animated.timing(animation, {
          toValue: 1,
          duration: height <= guideHeight ? 500 : 0,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  useEffect(() => {
    showOverlay(
      <View style={styles.infoOverlay}>
        <RNText style={styles.infoTitle}>
          재학 증빙 이미지 1장을 업로드해 주세요
        </RNText>
        <RNText style={styles.infoDesc}>
          학생증 또는 재학증명서 중 하나면 충분합니다.
        </RNText>
        <RNText style={styles.infoDesc}>
          이름/학과/학교명 외 불필요 정보는 가려서 올려주세요.
        </RNText>
        <Image
          source={require("@assets/images/instagram-lock.png")}
          style={{
            width: 48,
            height: 48,
            position: "absolute",
            top: -28,
            left: -28,
          }}
        />
      </View>
    );
  }, []);

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

        {!visible && (
          <Animated.View
            style={[styles.infoInline, { opacity: animation, marginTop: 24 }]}
          >
            <RNText style={styles.infoTitle}>이미지 업로드 안내</RNText>
            <RNText style={styles.infoDesc}>
              이름/학과/학교명 정보가 식별 가능해야 승인이 빨라져요.
            </RNText>
            <RNText style={styles.infoDesc}>
              사진인증은 최대 12시간 이내 관리자가 승인해요.
            </RNText>
          </Animated.View>
        )}
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
    backgroundColor: "#F2ECFF",
    borderWidth: 1,
    borderColor: "#FFF",
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
    backgroundColor: "#F2ECFF",
    borderWidth: 1,
    borderColor: "#FFF",
    shadowColor: "#F2ECFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3,
  },
  infoTitle: {
    color: "#9F84D8",
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
    backgroundColor: "#fff",
  },
});
