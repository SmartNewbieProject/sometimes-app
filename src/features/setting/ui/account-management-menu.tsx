import { useAuth } from "@/src/features/auth";
import { Text } from "@/src/shared/ui";
import { router } from "expo-router";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import Menu from "./menu";

const AccountManagementMenu = () => {
  const { logout } = useAuth();
  const options = [
    {
      text: "로그아웃",
      onClick: logout,
    },
    {
      text: "회원 탈퇴",
      onClick: () => router.navigate("/my/withdrawal"),
    },
  ];
  return <Menu title="계정 관리" options={options} />;
};

export default AccountManagementMenu;
