import { useAuth } from "@/src/features/auth";
import { router } from "expo-router";
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
