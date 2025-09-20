import { useAuth } from "@/src/features/auth";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import Menu from "./menu";

const AccountManagementMenu = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const options = [
    {
      text: t("features.setting.ui.menu.logout"),
      onClick: logout,
    },
    {
      text: t("features.setting.ui.menu.member_withdrawal"),
      onClick: () => router.navigate("/my/withdrawal"),
    },
  ];
  return <Menu title={t("features.setting.ui.menu.account_management")} options={options} />;
};

export default AccountManagementMenu;