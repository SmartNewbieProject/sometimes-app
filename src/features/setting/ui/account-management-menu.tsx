import { useAuth } from "@/src/features/auth";
import { useModal } from "@/src/shared/hooks/use-modal";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import Menu from "./menu";

const AccountManagementMenu = () => {
  const { logout } = useAuth();
  const { showModal } = useModal();

  const options = [
    {
      text: "로그아웃",
      onClick: () =>
        showModal({
          showLogo: true,
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
            text: "로그아웃",
            onClick: logout,
          },
        }),
    },
    {
      text: "회원 탈퇴",
      onClick: () =>
        showModal({
          showLogo: true,
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
            text: "로그아웃",
            onClick: () => router.navigate("/my/withdrawal"),
          },
        }),
    },
  ];
  return <Menu title="계정 관리" options={options} />;
};

const styles = StyleSheet.create({
  modalContentContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 8,
    height: 40,
  },
  modalContentText: {
    color: "#AEAEAE",
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
