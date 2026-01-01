import { useAuth } from "@/src/features/auth";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useModal } from "@/src/shared/hooks/use-modal";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useMixpanel } from "@/src/shared/hooks/use-mixpanel";
import Menu from "./menu";

const AccountManagementMenu = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { showModal } = useModal();
  const { accountEvents } = useMixpanel();

  const options = [
    {
      text: t("features.setting.ui.menu.logout"),

      onClick: () =>
        showModal({
          showLogo: true,
          reverse: true,
          customTitle: (
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Text style={styles.modalTitleText}>{t("features.setting.ui.logout_modal.title")}</Text>
            </View>
          ),

          children: (
            <View style={styles.modalContentContainer}>
              <Text style={styles.modalContentText}>
                {t("features.setting.ui.logout_modal.description_1")}
              </Text>
              <Text style={styles.modalContentText}>
                {t("features.setting.ui.logout_modal.description_2")}
              </Text>
            </View>
          ),
          primaryButton: {
            text: t("features.setting.ui.logout_modal.cancel"),
            onClick: () => {},
          },
          secondaryButton: {
            text: t("features.setting.ui.menu.logout"),
            onClick: logout,
          },
        }),
    },
    {
      text: t("features.setting.ui.menu.member_withdrawal"),
      onClick: () =>
        showModal({
          showLogo: true,
          reverse: true,
          customTitle: (
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Text style={styles.modalTitleText}>{t("features.setting.ui.withdrawal_modal.title")}</Text>
            </View>
          ),

          children: (
            <View style={styles.modalContentContainer}>
              <Text style={styles.modalContentText}>
                {t("features.setting.ui.withdrawal_modal.description_1")}
              </Text>
              <Text style={styles.modalContentText}>{t("features.setting.ui.withdrawal_modal.description_2")}</Text>
            </View>
          ),
          primaryButton: {
            text: t("features.setting.ui.withdrawal_modal.cancel"),
            onClick: () => {
              accountEvents.trackAccountDeletionCancelled('user_cancelled');
            },
          },
          secondaryButton: {
            text: t("features.setting.ui.withdrawal_modal.withdraw"),
            onClick: () => router.navigate("/my/withdrawal"),
          },
        }),
    },
  ];
  return <Menu title={t("features.setting.ui.menu.account_management")} options={options} />;
};

const styles = StyleSheet.create({
  modalContentContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 8,
    height: 40,
  },
  modalContentText: {
    color: semanticColors.text.disabled,
    fontSize: 12,
  },
  modalTitleText: {
    fontSize: 20,
    fontWeight: 600,
    fontFamily: "Pretendard-Bold",
    lineHeight: 24,
  },
});

export default AccountManagementMenu;