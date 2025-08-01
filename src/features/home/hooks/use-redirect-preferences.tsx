import { useModal } from "@/src/shared/hooks/use-modal";
import { useStorage } from "@/src/shared/hooks/use-storage";
import { dayUtils } from "@/src/shared/libs";
import { Text } from "@/src/shared/ui";
import { track } from "@amplitude/analytics-react-native";
import { router } from "expo-router";
import { useCallback, useEffect } from "react";
import { View } from "react-native";
import { useCheckPreferenceFillQuery } from "../queries";

type CheckPreferences = {
  isLater: boolean;
  latestDate: string | null;
};

export const useRedirectPreferences = () => {
  const {
    data: isPreferenceFill,
    refetch,
    isLoading,
  } = useCheckPreferenceFillQuery();
  const {
    value: latest,
    setValue,
    loading,
  } = useStorage<CheckPreferences>({
    key: "redirect-preferences",
  });
  const { showModal } = useModal();

  const confirm = useCallback(() => {
    track("Interest_Hold");
    setValue({
      isLater: true,
      latestDate: dayUtils.create().format("YYYY-MM-DD HH:mm:ss"),
    });
  }, [setValue]);

  const onRedirect = useCallback(() => {
    confirm();
    track("Interest_Started", { type: "modal" });
    router.navigate("/interest");
  }, [confirm]);

  const showPreferenceModal = useCallback(
    (reason: string) => {
      console.log("Showing modal -", reason);
      showModal({
        customTitle: (
          <Text size="md" weight="bold" textColor="black" className="mb-2">
            회원님의 이상형 정보가 없어요!
          </Text>
        ),
        children: (
          <View className="flex flex-col">
            <Text size="sm" textColor="black">
              나에게 맞는 연인 매칭을 위해
            </Text>
            <Text size="sm" textColor="black">
              회원님의 이상형 정보를 등록하시겠어요?
            </Text>
          </View>
        ),
        primaryButton: {
          text: "등록할게요!",
          onClick: onRedirect,
        },
        secondaryButton: {
          text: "나중에 할게요",
          onClick: confirm,
        },
      });
    },
    [showModal, onRedirect, confirm]
  );

  useEffect(() => {
    // 로딩 중이거나 이상형이 이미 등록된 경우 모달을 보여주지 않음
    if (loading || isLoading || isPreferenceFill) {
      console.log("Modal not shown - loading or preference filled:", {
        loading,
        isLoading,
        isPreferenceFill,
      });
      return;
    }

    if (isPreferenceFill === false) {
      if (!latest || !latest.isLater) {
        showPreferenceModal("no preference and no later flag");
        return;
      }

      const now = dayUtils.create();
      const diff = now.diff(latest?.latestDate, "day");
      if (diff > 1) {
        showPreferenceModal("later flag expired");
      }
    }
  }, [
    loading,
    isLoading,
    isPreferenceFill,
    latest?.isLater,
    latest?.latestDate,
    showPreferenceModal,
  ]);

  return {
    ...latest,
    isPreferenceFill,
    refetchPreferenceFill: refetch,
  };
};
