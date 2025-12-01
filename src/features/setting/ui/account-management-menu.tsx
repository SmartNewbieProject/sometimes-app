import { useAuth } from "@/src/features/auth";
import { semanticColors } from '../../../shared/constants/colors';
import { useModal } from "@/src/shared/hooks/use-modal";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import Menu from "./menu";

const AccountManagementMenu = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { showModal } = useModal();

  const options = [
    {
      text: "로그아웃",

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
              <Text style={styles.modalTitleText}>로그아웃 하시겠습니까?</Text>
            </View>
          ),

          children: (
            <View style={styles.modalContentContainer}>
              <Text style={styles.modalContentText}>
                로그아웃 시 일부 기능을 사용할 수 없으며,
              </Text>
              <Text style={styles.modalContentText}>
                다시 로그인해야 합니다.
              </Text>
            </View>
          ),
          primaryButton: {
            text: "취소",
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
              <Text style={styles.modalTitleText}>정말 탈퇴하시겠습니까?</Text>
            </View>
          ),

          children: (
            <View style={styles.modalContentContainer}>
              <Text style={styles.modalContentText}>
                탈퇴할 시, 계정은 삭제되며
              </Text>
              <Text style={styles.modalContentText}>복구되지 않습니다.</Text>
            </View>
          ),
          primaryButton: {
            text: "취소",
            onClick: () => {},
          },
          secondaryButton: {
            text: "탈퇴",
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