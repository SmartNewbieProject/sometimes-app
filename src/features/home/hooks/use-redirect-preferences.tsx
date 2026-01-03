import { useModal } from "@/src/shared/hooks/use-modal";
import { useStorage } from "@/src/shared/hooks/use-storage";
import { useOnboardingCompleted } from "@/src/shared/hooks/use-onboarding-completed";
import { dayUtils } from "@/src/shared/libs";
import { Text } from "@/src/shared/ui";
import { useMixpanel } from "@/src/shared/hooks";
import { router } from "expo-router";
import { useCallback, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useCheckPreferenceFillQuery } from "../queries";
import { devLogWithTag } from "@/src/shared/utils";
import { useTranslation } from "react-i18next";

type CheckPreferences = {
  isLater: boolean;
  latestDate: string | null;
};

export const useRedirectPreferences = () => {
  const { t } = useTranslation();
  const { trackEvent } = useMixpanel();
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
  const {
    isCompleted: isOnboardingCompleted,
    loading: onboardingLoading,
    syncWithServerStatus,
  } = useOnboardingCompleted();

  useEffect(() => {
    if (!isLoading && isPreferenceFill !== undefined) {
      syncWithServerStatus(isPreferenceFill);
    }
  }, [isLoading, isPreferenceFill, syncWithServerStatus]);

  const confirm = useCallback(() => {
    trackEvent('INTEREST_HOLD');
    setValue({
      isLater: true,
      latestDate: dayUtils.create().format("YYYY-MM-DD HH:mm:ss"),
    });
  }, [setValue, trackEvent]);

  const onRedirect = useCallback(() => {
    confirm();
    trackEvent('INTEREST_STARTED', { type: 'modal' });
    router.navigate("/interest");
  }, [confirm, trackEvent]);

  const showPreferenceModal = useCallback(
    (reason: string) => {
      devLogWithTag('Preference Modal', 'Showing:', reason);
      showModal({
        customTitle: (
          <Text size="md" weight="bold" textColor="black" style={modalStyles.title}>
            {t("features.home.ui.preference_modal.title")}
          </Text>
        ),
        children: (
          <View style={modalStyles.container}>
            <Text size="sm" textColor="black">
              {t("features.home.ui.preference_modal.description_line1")}
            </Text>
            <Text size="sm" textColor="black">
              {t("features.home.ui.preference_modal.description_line2")}
            </Text>
          </View>
        ),
        primaryButton: {
          text: t("features.home.ui.preference_modal.primary_button"),
          onClick: onRedirect,
        },
        secondaryButton: {
          text: t("features.home.ui.preference_modal.secondary_button"),
          onClick: confirm,
        },
      });
    },
    [showModal, onRedirect, confirm]
  );

  useEffect(() => {
    // 이상형 정보 모달 비활성화
    // 로딩 중이거나 이상형이 이미 등록된 경우 모달을 보여주지 않음
    if (loading || isLoading || isPreferenceFill) {
      devLogWithTag('Preference Modal', 'Skipped:', {
        loading,
        isLoading,
        isPreferenceFill,
      });
      return;
    }

    // 모달 표시 로직 제거됨
    // if (isPreferenceFill === false) {
    //   if (!latest || !latest.isLater) {
    //     showPreferenceModal("no preference and no later flag");
    //     return;
    //   }

    //   const now = dayUtils.create();
    //   const diff = now.diff(latest?.latestDate, "day");
    //   if (diff > 1) {
    //     showPreferenceModal("later flag expired");
    //   }
    // }
  }, [
    loading,
    isLoading,
    isPreferenceFill,
  ]);

  return {
    ...latest,
    isPreferenceFill,
    refetchPreferenceFill: refetch,
    isOnboardingCompleted,
    onboardingLoading,
  };
};

const modalStyles = StyleSheet.create({
  title: {
    marginBottom: 8,
  },
  container: {
    flexDirection: 'column',
  },
});
